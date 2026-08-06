<?php
namespace App\Entity;
use App\Repository\LigneStationRepository;
use Doctrine\ORM\Mapping as ORM;
#[ORM\Entity(repositoryClass: LigneStationRepository::class)]
class LigneStation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;
    #[ORM\ManyToOne(inversedBy: 'ligneStations')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Ligne $ligne = null;
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Station $station = null;
    #[ORM\Column]
    private ?int $ordre = null;
    #[ORM\Column(nullable: true)]
    private ?float $distanceDepuisDebut = null;
    public function getId(): ?int { return $this->id; }
    public function getLigne(): ?Ligne { return $this->ligne; }
    public function setLigne(?Ligne $ligne): static { $this->ligne = $ligne; return $this; }
    public function getStation(): ?Station { return $this->station; }
    public function setStation(?Station $station): static { $this->station = $station; return $this; }
    public function getOrdre(): ?int { return $this->ordre; }
    public function setOrdre(int $ordre): static { $this->ordre = $ordre; return $this; }
    public function getDistanceDepuisDebut(): ?float { return $this->distanceDepuisDebut; }
    public function setDistanceDepuisDebut(?float $distanceDepuisDebut): static { $this->distanceDepuisDebut = $distanceDepuisDebut; return $this; }
}
