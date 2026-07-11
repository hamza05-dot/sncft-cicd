<?php

namespace App\Controller;

use App\Entity\Trajet;
use App\Repository\TrajetRepository;
use App\Repository\StationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/trajets')]
class TrajetController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(TrajetRepository $repo): JsonResponse
    {
        $trajets = $repo->findAll();
        $data = array_map(fn($t) => [
            'id' => $t->getId(),
            'distanceKm' => $t->getDistanceKm(),
            'stationDepart' => $t->getStationDepart()->getNom(),
            'stationArrivee' => $t->getStationArrivee()->getNom(),
        ], $trajets);

        return $this->json($data);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(Trajet $trajet): JsonResponse
    {
        return $this->json([
            'id' => $trajet->getId(),
            'distanceKm' => $trajet->getDistanceKm(),
            'stationDepart' => $trajet->getStationDepart()->getNom(),
            'stationArrivee' => $trajet->getStationArrivee()->getNom(),
        ]);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, StationRepository $stationRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $trajet = new Trajet();
        $trajet->setDistanceKm($data['distanceKm']);
        $trajet->setStationDepart($stationRepo->find($data['stationDepartId']));
        $trajet->setStationArrivee($stationRepo->find($data['stationArriveeId']));

        $em->persist($trajet);
        $em->flush();

        return $this->json(['message' => 'Trajet créé', 'id' => $trajet->getId()], 201);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(Trajet $trajet, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($trajet);
        $em->flush();

        return $this->json(['message' => 'Trajet supprimé']);
    }
}
