<?php

namespace App\Controller;

use App\Entity\Train;
use App\Repository\TrainRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/trains')]
class TrainController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(TrainRepository $repo): JsonResponse
    {
        $trains = $repo->findAll();
        $data = array_map(fn($t) => [
            'id' => $t->getId(),
            'numero' => $t->getNumero(),
            'type' => $t->getType(),
            'capacite' => $t->getCapacite(),
        ], $trains);

        return $this->json($data);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(Train $train): JsonResponse
    {
        return $this->json([
            'id' => $train->getId(),
            'numero' => $train->getNumero(),
            'type' => $train->getType(),
            'capacite' => $train->getCapacite(),
        ]);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $train = new Train();
        $train->setNumero($data['numero']);
        $train->setType($data['type']);
        $train->setCapacite($data['capacite']);

        $em->persist($train);
        $em->flush();

        return $this->json(['message' => 'Train créé', 'id' => $train->getId()], 201);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(Train $train, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $train->setNumero($data['numero'] ?? $train->getNumero());
        $train->setType($data['type'] ?? $train->getType());
        $train->setCapacite($data['capacite'] ?? $train->getCapacite());

        $em->flush();

        return $this->json(['message' => 'Train mis à jour']);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(Train $train, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($train);
        $em->flush();

        return $this->json(['message' => 'Train supprimé']);
    }
}
