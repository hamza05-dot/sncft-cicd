<?php

namespace App\Controller;

use App\Entity\Horaire;
use App\Entity\Notification;
use App\Repository\HoraireRepository;
use App\Repository\TrainRepository;
use App\Repository\TrajetRepository;
use App\Repository\FavoriRepository;
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
        $data = [];
        foreach ($horaires as $h) {
            $data[] = [
                'id' => $h->getId(),
                'heureDepart' => $h->getHeureDepart()->format('H:i'),
                'heureArrivee' => $h->getHeureArrivee()->format('H:i'),
                'jours' => $h->getJours(),
                'statut' => $h->getStatut(),
                'retardMinutes' => $h->getRetardMinutes(),
                'train' => $h->getTrain()->getNumero(),
                'trajet' => $h->getTrajet()->getStationDepart()->getNom().' -> '.$h->getTrajet()->getStationArrivee()->getNom(),
            ];
        }
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
            'retardMinutes' => $horaire->getRetardMinutes(),
            'train' => $horaire->getTrain()->getNumero(),
            'trajet' => $horaire->getTrajet()->getStationDepart()->getNom().' -> '.$horaire->getTrajet()->getStationArrivee()->getNom(),
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
        $horaire->setStatut($data['statut'] ?? "A l'heure");
        $horaire->setRetardMinutes(null);
        $horaire->setTrain($trainRepo->find($data['trainId']));
        $horaire->setTrajet($trajetRepo->find($data['trajetId']));

        $em->persist($horaire);
        $em->flush();

        return $this->json(['message' => 'Horaire cree', 'id' => $horaire->getId()], 201);
    }

    #[Route('/{id}/statut', methods: ['PUT'])]
    public function updateStatut(Horaire $horaire, Request $request, EntityManagerInterface $em, FavoriRepository $favoriRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $ancienStatut = $horaire->getStatut();

        $horaire->setStatut($data['statut']);
        $horaire->setRetardMinutes($data['retardMinutes'] ?? null);

        // Créer notifications pour tous les favoris
        $favoris = $favoriRepo->findBy(['horaire' => $horaire]);
        foreach ($favoris as $favori) {
            $notification = new Notification();
            $notification->setVoyageur($favori->getVoyageur());
            $notification->setHoraire($horaire);
            $notification->setDateCreation(new \DateTime());
            $notification->setLu(false);

            if ($data['statut'] === 'Retard') {
                $minutes = $data['retardMinutes'] ?? 0;
                $notification->setMessage("Votre train ".$horaire->getTrain()->getNumero()." est en retard de ".$minutes." minutes.");
                $notification->setType('RETARD');
            } elseif ($data['statut'] === 'Annule') {
                $notification->setMessage("Votre train ".$horaire->getTrain()->getNumero()." est annule.");
                $notification->setType('ANNULATION');
            } else {
                $notification->setMessage("Votre train ".$horaire->getTrain()->getNumero()." est maintenant a l'heure.");
                $notification->setType('INFO');
            }

            $em->persist($notification);
        }

        $em->flush();

        return $this->json(['message' => 'Statut mis a jour', 'notifications_envoyees' => count($favoris)]);
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

        return $this->json(['message' => 'Horaire mis a jour']);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(Horaire $horaire, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($horaire);
        $em->flush();

        return $this->json(['message' => 'Horaire supprime']);
    }
}
