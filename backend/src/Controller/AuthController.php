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

    #[Route('/me', methods: ['PUT'])]
    public function updateMe(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $hasher
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Non authentifie'], 401);
        }

        $data = json_decode($request->getContent(), true);
        $currentPassword = $data['currentPassword'] ?? null;

        // Any change to email or password requires the current password,
        // so a stolen session token alone can't take over the account.
        $wantsEmailChange = !empty($data['email']) && $data['email'] !== $user->getEmail();
        $wantsPasswordChange = !empty($data['newPassword']);

        if ($wantsEmailChange || $wantsPasswordChange) {
            if (!$currentPassword || !$hasher->isPasswordValid($user, $currentPassword)) {
                return $this->json(['message' => 'Mot de passe actuel incorrect'], 400);
            }
        }

        if ($wantsEmailChange) {
            $existing = $em->getRepository(User::class)->findOneBy(['email' => $data['email']]);
            if ($existing) {
                return $this->json(['message' => 'Cet email est deja utilise'], 400);
            }
            $user->setEmail($data['email']);
        }

        if ($wantsPasswordChange) {
            if (strlen($data['newPassword']) < 8) {
                return $this->json(['message' => 'Le nouveau mot de passe doit contenir au moins 8 caracteres'], 400);
            }
            $user->setPassword($hasher->hashPassword($user, $data['newPassword']));
        }

        $em->flush();

        return $this->json([
            'message' => 'Profil mis a jour',
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
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
