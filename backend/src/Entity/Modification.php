<?php

namespace App\Entity;

use App\Repository\ModificationRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ModificationRepository::class)]
class Modification
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?\DateTime $dateModif = null;

    #[ORM\Column]
    private ?\DateTime $ancienneHeure = null;

    #[ORM\Column]
    private ?\DateTime $nouvelleHeure = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $motif = null;

    #[ORM\Column(length: 50)]
    private ?string $type = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Horaire $horaire = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDateModif(): ?\DateTime
    {
        return $this->dateModif;
    }

    public function setDateModif(\DateTime $dateModif): static
    {
        $this->dateModif = $dateModif;

        return $this;
    }

    public function getAncienneHeure(): ?\DateTime
    {
        return $this->ancienneHeure;
    }

    public function setAncienneHeure(\DateTime $ancienneHeure): static
    {
        $this->ancienneHeure = $ancienneHeure;

        return $this;
    }

    public function getNouvelleHeure(): ?\DateTime
    {
        return $this->nouvelleHeure;
    }

    public function setNouvelleHeure(\DateTime $nouvelleHeure): static
    {
        $this->nouvelleHeure = $nouvelleHeure;

        return $this;
    }

    public function getMotif(): ?string
    {
        return $this->motif;
    }

    public function setMotif(?string $motif): static
    {
        $this->motif = $motif;

        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getHoraire(): ?Horaire
    {
        return $this->horaire;
    }

    public function setHoraire(?Horaire $horaire): static
    {
        $this->horaire = $horaire;

        return $this;
    }
}
