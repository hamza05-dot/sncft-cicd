<?php

namespace App\Controller;

use App\Repository\NotificationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/notifications')]
class NotificationController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(NotificationRepository $repo): JsonResponse
    {
        $user = $this->getUser();
        $notifications = $repo->findBy(
            ['voyageur' => $user],
            ['dateCreation' => 'DESC']
        );
        $data = [];
        foreach ($notifications as $n) {
            $data[] = [
                'id' => $n->getId(),
                'message' => $n->getMessage(),
                'type' => $n->getType(),
                'lu' => $n->isLu(),
                'dateCreation' => $n->getDateCreation()->format('Y-m-d H:i'),
                'horaire' => $n->getHoraire()->getId(),
            ];
        }
        return $this->json($data);
    }

    #[Route('/non-lues', methods: ['GET'])]
    public function nonLues(NotificationRepository $repo): JsonResponse
    {
        $user = $this->getUser();
        $notifications = $repo->findBy(['voyageur' => $user, 'lu' => false]);
        return $this->json(['count' => count($notifications)]);
    }

    #[Route('/{id}/lire', methods: ['PUT'])]
    public function marquerLue(int $id, NotificationRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $notification = $repo->find($id);

        if (!$notification) {
            return $this->json(['message' => 'Notification non trouvee'], 404);
        }

        // Fix IDOR - verify ownership
        if ($notification->getVoyageur() !== $user) {
            return $this->json(['message' => 'Acces refuse'], 403);
        }

        $notification->setLu(true);
        $em->flush();
        return $this->json(['message' => 'Notification marquee comme lue']);
    }

    #[Route('/lire-toutes', methods: ['PUT'])]
    public function marquerToutesLues(NotificationRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $notifications = $repo->findBy(['voyageur' => $user, 'lu' => false]);
        foreach ($notifications as $n) {
            $n->setLu(true);
        }
        $em->flush();
        return $this->json(['message' => 'Toutes les notifications marquees comme lues']);
    }
}
