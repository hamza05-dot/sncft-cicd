<?php

namespace App\Entity;

use App\Repository\TrajetRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TrajetRepository::class)]
class Trajet
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?float $distanceKm = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Station $stationDepart = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Station $stationArrivee = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDistanceKm(): ?float
    {
        return $this->distanceKm;
    }

    public function setDistanceKm(float $distanceKm): static
    {
        $this->distanceKm = $distanceKm;

        return $this;
    }

    public function getStationDepart(): ?Station
    {
        return $this->stationDepart;
    }

    public function setStationDepart(?Station $stationDepart): static
    {
        $this->stationDepart = $stationDepart;

        return $this;
    }

    public function getStationArrivee(): ?Station
    {
        return $this->stationArrivee;
    }

    public function setStationArrivee(?Station $stationArrivee): static
    {
        $this->stationArrivee = $stationArrivee;

        return $this;
    }
}
