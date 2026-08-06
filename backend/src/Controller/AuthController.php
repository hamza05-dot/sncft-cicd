<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Mercure\Jwt\TokenFactoryInterface;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    #[Route('/register', methods: ['POST'])]
    public function register(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $hasher
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $user = new User();
        $user->setEmail($data['email']);
        $user->setRoles($data['roles'] ?? ['ROLE_USER']);
        $user->setPassword($hasher->hashPassword($user, $data['password']));

        $em->persist($user);
        $em->flush();

        return $this->json([
            'message' => 'Utilisateur créé',
            'email' => $user->getEmail(),
            'roles' => $user->getRoles()
        ], 201);
    }

    #[Route('/me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();
        return $this->json([
            'email' => $user->getUserIdentifier(),
            'roles' => $user->getRoles()
        ]);
    }

    #[Route('/mercure-token', methods: ['GET'])]
    public function mercureToken(TokenFactoryInterface $defaultTokenFactory): JsonResponse
    {
        $user = $this->getUser();
        $topic = 'https://sncft.tn/notifications/' . $user->getId();
        $token = $defaultTokenFactory->create(subscribe: [$topic]);
        return $this->json(['token' => $token, 'topic' => $topic]);
    }
}
