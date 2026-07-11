<?php

namespace App\Controller;

use App\Entity\Horaire;
use App\Repository\HoraireRepository;
use App\Repository\TrainRepository;
use App\Repository\TrajetRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/horaires')]
class HoraireController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(HoraireRepository $repo): JsonResponse
    {
        $horaires = $repo->findAll();
        $data = array_map(fn($h) => [
            'id' => $h->getId(),
            'heureDepart' => $h->getHeureDepart()->format('H:i'),
            'heureArrivee' => $h->getHeureArrivee()->format('H:i'),
            'jours' => $h->getJours(),
            'statut' => $h->getStatut(),
            'train' => $h->getTrain()->getNumero(),
            'trajet' => $h->getTrajet()->getStationDepart()->getNom().' → '.$h->getTrajet()->getStationArrivee()->getNom(),
        ], $horaires);

        return $this->json($data);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(Horaire $horaire): JsonResponse
    {
        return $this->json([
            'id' => $horaire->getId(),
            'heureDepart' => $horaire->getHeureDepart()->format('H:i'),
            'heureArrivee' => $horaire->getHeureArrivee()->format('H:i'),
            'jours' => $horaire->getJours(),
            'statut' => $horaire->getStatut(),
            'train' => $horaire->getTrain()->getNumero(),
            'trajet' => $horaire->getTrajet()->getStationDepart()->getNom().' → '.$horaire->getTrajet()->getStationArrivee()->getNom(),
        ]);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, TrainRepository $trainRepo, TrajetRepository $trajetRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $horaire = new Horaire();
        $horaire->setHeureDepart(new \DateTime($data['heureDepart']));
        $horaire->setHeureArrivee(new \DateTime($data['heureArrivee']));
        $horaire->setJours($data['jours']);
        $horaire->setStatut($data['statut'] ?? 'A l\'heure');
        $horaire->setTrain($trainRepo->find($data['trainId']));
        $horaire->setTrajet($trajetRepo->find($data['trajetId']));

        $em->persist($horaire);
        $em->flush();

        return $this->json(['message' => 'Horaire créé', 'id' => $horaire->getId()], 201);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(Horaire $horaire, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['heureDepart'])) $horaire->setHeureDepart(new \DateTime($data['heureDepart']));
        if (isset($data['heureArrivee'])) $horaire->setHeureArrivee(new \DateTime($data['heureArrivee']));
        if (isset($data['jours'])) $horaire->setJours($data['jours']);
        if (isset($data['statut'])) $horaire->setStatut($data['statut']);

        $em->flush();

        return $this->json(['message' => 'Horaire mis à jour']);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(Horaire $horaire, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($horaire);
        $em->flush();

        return $this->json(['message' => 'Horaire supprimé']);
    }
}
