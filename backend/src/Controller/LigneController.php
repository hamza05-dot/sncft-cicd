<?php

namespace App\Controller;

use App\Repository\LigneRepository;
use App\Repository\LigneStationRepository;
use App\Repository\HoraireRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/lignes')]
class LigneController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(LigneRepository $repo): JsonResponse
    {
        $lignes = $repo->findAll();
        $data = array_map(fn($l) => [
            'id' => $l->getId(),
            'nom' => $l->getNom(),
            'code' => $l->getCode(),
        ], $lignes);

        return $this->json($data);
    }

    #[Route('/{id}/stations', methods: ['GET'])]
    public function stations(int $id, LigneStationRepository $repo): JsonResponse
    {
        $ligneStations = $repo->findBy(['ligne' => $id], ['ordre' => 'ASC']);

        $data = array_map(fn($ls) => [
            'id' => $ls->getStation()->getId(),
            'nom' => $ls->getStation()->getNom(),
            'ville' => $ls->getStation()->getVille(),
            'ordre' => $ls->getOrdre(),
        ], $ligneStations);

        return $this->json($data);
    }

    #[Route('/{id}/horaires', methods: ['GET'])]
    public function horaires(int $id, HoraireRepository $repo): JsonResponse
    {
        $horaires = $repo->findByLigne($id);

        $data = array_map(fn($h) => [
            'id' => $h->getId(),
            'heureDepart' => $h->getHeureDepart()->format('H:i'),
            'heureArrivee' => $h->getHeureArrivee()->format('H:i'),
            'jours' => $h->getJours(),
            'statut' => $h->getStatut(),
            'retardMinutes' => $h->getRetardMinutes(),
            'train' => $h->getTrain()->getNumero(),
            'stationDepart' => $h->getTrajet()->getStationDepart()->getNom(),
            'stationArrivee' => $h->getTrajet()->getStationArrivee()->getNom(),
        ], $horaires);

        return $this->json($data);
    }
}
