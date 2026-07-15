<?php

namespace App\Controller;

use App\Entity\Personnel;
use App\Repository\PersonnelRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/personnel')]
class PersonnelController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(PersonnelRepository $repo): JsonResponse
    {
        $personnel = $repo->findAll();
        $data = array_map(fn($p) => [
            'id' => $p->getId(),
            'nom' => $p->getNom(),
            'prenom' => $p->getPrenom(),
            'email' => $p->getEmail(),
            'telephone' => $p->getTelephone(),
            'role' => $p->getRole(),
        ], $personnel);

        return $this->json($data);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(Personnel $personnel): JsonResponse
    {
        return $this->json([
            'id' => $personnel->getId(),
            'nom' => $personnel->getNom(),
            'prenom' => $personnel->getPrenom(),
            'email' => $personnel->getEmail(),
            'telephone' => $personnel->getTelephone(),
            'role' => $personnel->getRole(),
        ]);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $personnel = new Personnel();
        $personnel->setNom($data['nom']);
        $personnel->setPrenom($data['prenom']);
        $personnel->setEmail($data['email']);
        $personnel->setTelephone($data['telephone'] ?? null);
        $personnel->setRole($data['role']);

        $em->persist($personnel);
        $em->flush();

        return $this->json(['message' => 'Personnel créé', 'id' => $personnel->getId()], 201);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(Personnel $personnel, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $personnel->setNom($data['nom'] ?? $personnel->getNom());
        $personnel->setPrenom($data['prenom'] ?? $personnel->getPrenom());
        $personnel->setEmail($data['email'] ?? $personnel->getEmail());
        $personnel->setTelephone($data['telephone'] ?? $personnel->getTelephone());
        $personnel->setRole($data['role'] ?? $personnel->getRole());

        $em->flush();

        return $this->json(['message' => 'Personnel mis à jour']);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(Personnel $personnel, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($personnel);
        $em->flush();

        return $this->json(['message' => 'Personnel supprimé']);
    }
}
