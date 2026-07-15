<?php

namespace App\Controller;

use App\Entity\Maintenance;
use App\Repository\MaintenanceRepository;
use App\Repository\TrainRepository;
use App\Repository\PersonnelRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/maintenances')]
class MaintenanceController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(MaintenanceRepository $repo): JsonResponse
    {
        $maintenances = $repo->findAll();
        $data = [];
        foreach ($maintenances as $m) {
            $data[] = [
                'id' => $m->getId(),
                'description' => $m->getDescription(),
                'dateDebut' => $m->getDateDebut()->format('Y-m-d H:i'),
                'dateFin' => $m->getDateFin() ? $m->getDateFin()->format('Y-m-d H:i') : null,
                'statut' => $m->getStatut(),
                'type' => $m->getType(),
                'train' => $m->getTrain()->getNumero(),
                'personnel' => $m->getPersonnel() ? $m->getPersonnel()->getNom().' '.$m->getPersonnel()->getPrenom() : null,
            ];
        }
        return $this->json($data);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(Maintenance $maintenance): JsonResponse
    {
        return $this->json([
            'id' => $maintenance->getId(),
            'description' => $maintenance->getDescription(),
            'dateDebut' => $maintenance->getDateDebut()->format('Y-m-d H:i'),
            'dateFin' => $maintenance->getDateFin() ? $maintenance->getDateFin()->format('Y-m-d H:i') : null,
            'statut' => $maintenance->getStatut(),
            'type' => $maintenance->getType(),
            'train' => $maintenance->getTrain()->getNumero(),
        ]);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, TrainRepository $trainRepo, PersonnelRepository $personnelRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $maintenance = new Maintenance();
        $maintenance->setDescription($data['description']);
        $maintenance->setDateDebut(new \DateTime($data['dateDebut']));
        $maintenance->setDateFin(isset($data['dateFin']) ? new \DateTime($data['dateFin']) : null);
        $maintenance->setStatut($data['statut'] ?? 'Planifie');
        $maintenance->setType($data['type']);
        $maintenance->setTrain($trainRepo->find($data['trainId']));
        if (isset($data['personnelId'])) {
            $maintenance->setPersonnel($personnelRepo->find($data['personnelId']));
        }

        $em->persist($maintenance);
        $em->flush();

        return $this->json(['message' => 'Maintenance creee', 'id' => $maintenance->getId()], 201);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(Maintenance $maintenance, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['description'])) {
            $maintenance->setDescription($data['description']);
        }
        if (isset($data['statut'])) {
            $maintenance->setStatut($data['statut']);
        }
        if (isset($data['dateFin'])) {
            $maintenance->setDateFin(new \DateTime($data['dateFin']));
        }

        $em->flush();

        return $this->json(['message' => 'Maintenance mise a jour']);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(Maintenance $maintenance, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($maintenance);
        $em->flush();

        return $this->json(['message' => 'Maintenance supprimee']);
    }
}
