<?php

namespace App\Controller;

use App\Entity\Reservation;
use App\Repository\ReservationRepository;
use App\Repository\HoraireRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/reservations')]
class ReservationController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(ReservationRepository $repo): JsonResponse
    {
        $reservations = $repo->findAll();
        $data = [];
        foreach ($reservations as $r) {
            $data[] = [
                'id' => $r->getId(),
                'dateReservation' => $r->getDateReservation()->format('Y-m-d H:i'),
                'statut' => $r->getStatut(),
                'placesReservees' => $r->getPlacesReservees(),
                'voyageur' => $r->getVoyageur()->getEmail(),
                'horaire' => $r->getHoraire()->getId(),
            ];
        }
        return $this->json($data);
    }

    #[Route('/mes-reservations', methods: ['GET'])]
    public function mesReservations(ReservationRepository $repo): JsonResponse
    {
        $user = $this->getUser();
        $reservations = $repo->findBy(['voyageur' => $user]);
        $data = [];
        foreach ($reservations as $r) {
            $data[] = [
                'id' => $r->getId(),
                'dateReservation' => $r->getDateReservation()->format('Y-m-d H:i'),
                'statut' => $r->getStatut(),
                'placesReservees' => $r->getPlacesReservees(),
                'horaire' => $r->getHoraire()->getId(),
            ];
        }
        return $this->json($data);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, HoraireRepository $horaireRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $user = $this->getUser();

        $reservation = new Reservation();
        $reservation->setDateReservation(new \DateTime());
        $reservation->setStatut('En attente');
        $reservation->setPlacesReservees($data['placesReservees']);
        $reservation->setVoyageur($user);
        $reservation->setHoraire($horaireRepo->find($data['horaireId']));

        $em->persist($reservation);
        $em->flush();

        return $this->json(['message' => 'Reservation creee', 'id' => $reservation->getId()], 201);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(Reservation $reservation, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['statut'])) {
            $reservation->setStatut($data['statut']);
        }
        if (isset($data['placesReservees'])) {
            $reservation->setPlacesReservees($data['placesReservees']);
        }

        $em->flush();

        return $this->json(['message' => 'Reservation mise a jour']);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(Reservation $reservation, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($reservation);
        $em->flush();

        return $this->json(['message' => 'Reservation supprimee']);
    }
}
