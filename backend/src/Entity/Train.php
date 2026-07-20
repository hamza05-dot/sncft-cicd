<?php

namespace App\Entity;

use App\Repository\TrainRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: TrainRepository::class)]
class Train
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    #[Assert\NotBlank(message: 'Le numero est obligatoire')]
    #[Assert\Length(max: 50)]
    private ?string $numero = null;

    #[ORM\Column(length: 50)]
    #[Assert\NotBlank(message: 'Le type est obligatoire')]
    private ?string $type = null;

    #[ORM\Column]
    #[Assert\NotBlank(message: 'La capacite est obligatoire')]
    #[Assert\Positive(message: 'La capacite doit etre positive')]
    private ?int $capacite = null;

    public function getId(): ?int { return $this->id; }
    public function getNumero(): ?string { return $this->numero; }
    public function setNumero(string $numero): static { $this->numero = $numero; return $this; }
    public function getType(): ?string { return $this->type; }
    public function setType(string $type): static { $this->type = $type; return $this; }
    public function getCapacite(): ?int { return $this->capacite; }
    public function setCapacite(int $capacite): static { $this->capacite = $capacite; return $this; }
}
