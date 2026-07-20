<?php

namespace App\Controller;

use App\Entity\Train;
use App\Repository\TrainRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/trains')]
class TrainController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(TrainRepository $repo): JsonResponse
    {
        $trains = $repo->findAll();
        $data = [];
        foreach ($trains as $t) {
            $data[] = [
                'id' => $t->getId(),
                'numero' => $t->getNumero(),
                'type' => $t->getType(),
                'capacite' => $t->getCapacite(),
            ];
        }
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
    public function create(Request $request, EntityManagerInterface $em, ValidatorInterface $validator): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'JSON invalide'], 400);
        }

        $train = new Train();
        $train->setNumero($data['numero'] ?? '');
        $train->setType($data['type'] ?? '');
        $train->setCapacite($data['capacite'] ?? 0);

        $errors = $validator->validate($train);
        if (count($errors) > 0) {
            $messages = [];
            foreach ($errors as $error) {
                $messages[] = $error->getMessage();
            }
            return $this->json(['errors' => $messages], 400);
        }

        $em->persist($train);
        $em->flush();

        return $this->json(['message' => 'Train cree', 'id' => $train->getId()], 201);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(Train $train, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['numero'])) $train->setNumero($data['numero']);
        if (isset($data['type'])) $train->setType($data['type']);
        if (isset($data['capacite'])) $train->setCapacite($data['capacite']);

        $em->flush();
        return $this->json(['message' => 'Train mis a jour']);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(Train $train, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($train);
        $em->flush();
        return $this->json(['message' => 'Train supprime']);
    }
}
