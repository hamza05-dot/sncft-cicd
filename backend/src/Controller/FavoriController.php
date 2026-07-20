<?php

namespace App\Controller;

use App\Entity\Favori;
use App\Repository\FavoriRepository;
use App\Repository\HoraireRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/favoris')]
class FavoriController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(FavoriRepository $repo): JsonResponse
    {
        $user = $this->getUser();
        $favoris = $repo->findBy(['voyageur' => $user]);
        $data = [];
        foreach ($favoris as $f) {
            $data[] = [
                'id' => $f->getId(),
                'dateAjout' => $f->getDateAjout()->format('Y-m-d H:i'),
                'horaire' => [
                    'id' => $f->getHoraire()->getId(),
                    'heureDepart' => $f->getHoraire()->getHeureDepart()->format('H:i'),
                    'heureArrivee' => $f->getHoraire()->getHeureArrivee()->format('H:i'),
                    'train' => $f->getHoraire()->getTrain()->getNumero(),
                    'trajet' => $f->getHoraire()->getTrajet()->getStationDepart()->getNom().' -> '.$f->getHoraire()->getTrajet()->getStationArrivee()->getNom(),
                    'statut' => $f->getHoraire()->getStatut(),
                    'retardMinutes' => $f->getHoraire()->getRetardMinutes(),
                ],
            ];
        }
        return $this->json($data);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, HoraireRepository $horaireRepo, FavoriRepository $favoriRepo): JsonResponse
    {
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);
        $horaire = $horaireRepo->find($data['horaireId']);

        if (!$horaire) {
            return $this->json(['message' => 'Horaire non trouve'], 404);
        }

        $existing = $favoriRepo->findOneBy(['voyageur' => $user, 'horaire' => $horaire]);
        if ($existing) {
            return $this->json(['message' => 'Deja en favori'], 400);
        }

        $favori = new Favori();
        $favori->setDateAjout(new \DateTime());
        $favori->setVoyageur($user);
        $favori->setHoraire($horaire);

        $em->persist($favori);
        $em->flush();

        return $this->json(['message' => 'Ajoute aux favoris', 'id' => $favori->getId()], 201);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(Favori $favori, EntityManagerInterface $em): JsonResponse
    {
        // Fix IDOR - verify ownership
        if ($favori->getVoyageur() !== $this->getUser()) {
            return $this->json(['message' => 'Acces refuse'], 403);
        }

        $em->remove($favori);
        $em->flush();
        return $this->json(['message' => 'Retire des favoris']);
    }
}
