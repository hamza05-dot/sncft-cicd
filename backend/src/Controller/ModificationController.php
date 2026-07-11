<?php

namespace App\Controller;

use App\Entity\Modification;
use App\Repository\ModificationRepository;
use App\Repository\HoraireRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/modifications')]
class ModificationController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(ModificationRepository $repo): JsonResponse
    {
        $modifications = $repo->findAll();
        $data = array_map(fn($m) => [
            'id' => $m->getId(),
            'dateModif' => $m->getDateModif()->format('Y-m-d H:i'),
            'ancienneHeure' => $m->getAncienneHeure()->format('H:i'),
            'nouvelleHeure' => $m->getNouvelleHeure()->format('H:i'),
            'motif' => $m->getMotif(),
            'type' => $m->getType(),
            'horaireId' => $m->getHoraire()->getId(),
        ], $modifications);

        return $this->json($data);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(Modification $modification): JsonResponse
    {
        return $this->json([
            'id' => $modification->getId(),
            'dateModif' => $modification->getDateModif()->format('Y-m-d H:i'),
            'ancienneHeure' => $modification->getAncienneHeure()->format('H:i'),
            'nouvelleHeure' => $modification->getNouvelleHeure()->format('H:i'),
            'motif' => $modification->getMotif(),
            'type' => $modification->getType(),
            'horaireId' => $modification->getHoraire()->getId(),
        ]);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, HoraireRepository $horaireRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $modification = new Modification();
        $modification->setDateModif(new \DateTime());
        $modification->setAncienneHeure(new \DateTime($data['ancienneHeure']));
        $modification->setNouvelleHeure(new \DateTime($data['nouvelleHeure']));
        $modification->setMotif($data['motif'] ?? null);
        $modification->setType($data['type']);
        $modification->setHoraire($horaireRepo->find($data['horaireId']));

        $em->persist($modification);
        $em->flush();

        return $this->json(['message' => 'Modification créée', 'id' => $modification->getId()], 201);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(Modification $modification, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($modification);
        $em->flush();

        return $this->json(['message' => 'Modification supprimée']);
    }
}
