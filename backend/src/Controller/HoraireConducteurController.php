<?php

namespace App\Controller;

use App\Entity\HoraireConducteur;
use App\Repository\HoraireConducteurRepository;
use App\Repository\HoraireRepository;
use App\Repository\PersonnelRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/horaires-conducteurs')]
class HoraireConducteurController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(HoraireConducteurRepository $repo): JsonResponse
    {
        $horaires = $repo->findAll();
        $data = [];
        foreach ($horaires as $h) {
            $data[] = [
                'id' => $h->getId(),
                'date' => $h->getDate()->format('Y-m-d'),
                'conducteur' => $h->getConducteur()->getPrenom().' '.$h->getConducteur()->getNom(),
                'horaire' => [
                    'id' => $h->getHoraire()->getId(),
                    'heureDepart' => $h->getHoraire()->getHeureDepart()->format('H:i'),
                    'heureArrivee' => $h->getHoraire()->getHeureArrivee()->format('H:i'),
                    'train' => $h->getHoraire()->getTrain()->getNumero(),
                    'trajet' => $h->getHoraire()->getTrajet()->getStationDepart()->getNom().' -> '.$h->getHoraire()->getTrajet()->getStationArrivee()->getNom(),
                ],
            ];
        }
        return $this->json($data);
    }

    #[Route('/mon-planning', methods: ['GET'])]
    public function monPlanning(HoraireConducteurRepository $repo, PersonnelRepository $personnelRepo): JsonResponse
    {
        $user = $this->getUser();
        $personnel = $personnelRepo->findOneBy(['compte' => $user]);

        if (!$personnel) {
            return $this->json(['message' => 'Personnel non trouve'], 404);
        }

        $horaires = $repo->findBy(['conducteur' => $personnel]);
        $data = [];
        foreach ($horaires as $h) {
            $data[] = [
                'id' => $h->getId(),
                'date' => $h->getDate()->format('Y-m-d'),
                'horaire' => [
                    'id' => $h->getHoraire()->getId(),
                    'heureDepart' => $h->getHoraire()->getHeureDepart()->format('H:i'),
                    'heureArrivee' => $h->getHoraire()->getHeureArrivee()->format('H:i'),
                    'train' => $h->getHoraire()->getTrain()->getNumero(),
                    'trajet' => $h->getHoraire()->getTrajet()->getStationDepart()->getNom().' -> '.$h->getHoraire()->getTrajet()->getStationArrivee()->getNom(),
                    'statut' => $h->getHoraire()->getStatut(),
                ],
            ];
        }
        return $this->json($data);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, HoraireRepository $horaireRepo, PersonnelRepository $personnelRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $horaireConducteur = new HoraireConducteur();
        $horaireConducteur->setDate(new \DateTime($data['date']));
        $horaireConducteur->setConducteur($personnelRepo->find($data['conducteurId']));
        $horaireConducteur->setHoraire($horaireRepo->find($data['horaireId']));

        $em->persist($horaireConducteur);
        $em->flush();

        return $this->json(['message' => 'Planning assigne', 'id' => $horaireConducteur->getId()], 201);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(HoraireConducteur $horaireConducteur, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($horaireConducteur);
        $em->flush();
        return $this->json(['message' => 'Planning supprime']);
    }
}
