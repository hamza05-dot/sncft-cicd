<?php

namespace App\Controller;

use App\Entity\Station;
use App\Repository\StationRepository;
use App\Repository\TrajetRepository;
use App\Repository\LigneStationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/stations')]
class StationController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(StationRepository $repo): JsonResponse
    {
        $stations = $repo->findAll();
        $data = array_map(fn($s) => [
            'id' => $s->getId(),
            'nom' => $s->getNom(),
            'ville' => $s->getVille(),
            'adresse' => $s->getAddress(),
        ], $stations);

        return $this->json($data);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(Station $station): JsonResponse
    {
        return $this->json([
            'id' => $station->getId(),
            'nom' => $station->getNom(),
            'ville' => $station->getVille(),
            'adresse' => $station->getAddress(),
        ]);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $station = new Station();
        $station->setNom($data['nom']);
        $station->setVille($data['ville']);
        $station->setAddress($data['adresse'] ?? null);

        $em->persist($station);
        $em->flush();

        return $this->json(['message' => 'Station créée', 'id' => $station->getId()], 201);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(Station $station, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $station->setNom($data['nom'] ?? $station->getNom());
        $station->setVille($data['ville'] ?? $station->getVille());
        $station->setAddress($data['adresse'] ?? $station->getAddress());

        $em->flush();

        return $this->json(['message' => 'Station mise à jour']);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(
        Station $station,
        EntityManagerInterface $em,
        TrajetRepository $trajetRepo,
        LigneStationRepository $ligneStationRepo
    ): JsonResponse {
        $trajetsAsDepart = $trajetRepo->count(['stationDepart' => $station]);
        $trajetsAsArrivee = $trajetRepo->count(['stationArrivee' => $station]);
        $ligneStationsCount = $ligneStationRepo->count(['station' => $station]);

        $totalTrajets = $trajetsAsDepart + $trajetsAsArrivee;

        if ($totalTrajets > 0 || $ligneStationsCount > 0) {
            return $this->json([
                'message' => sprintf(
                    'Impossible de supprimer cette station : elle est utilisée dans %d trajet(s) et %d ligne(s). Supprimez ou modifiez ces éléments d\'abord.',
                    $totalTrajets,
                    $ligneStationsCount
                ),
            ], 409);
        }

        $em->remove($station);
        $em->flush();

        return $this->json(['message' => 'Station supprimée']);
    }
}
