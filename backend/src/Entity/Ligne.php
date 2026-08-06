<?php
namespace App\Entity;
use App\Repository\LigneRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
#[ORM\Entity(repositoryClass: LigneRepository::class)]
class Ligne
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;
    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'Le nom est obligatoire')]
    private ?string $nom = null;
    #[ORM\Column(length: 20, nullable: true)]
    private ?string $code = null;
    #[ORM\OneToMany(mappedBy: 'ligne', targetEntity: LigneStation::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['ordre' => 'ASC'])]
    private Collection $ligneStations;
    public function __construct()
    {
        $this->ligneStations = new ArrayCollection();
    }
    public function getId(): ?int { return $this->id; }
    public function getNom(): ?string { return $this->nom; }
    public function setNom(string $nom): static { $this->nom = $nom; return $this; }
    public function getCode(): ?string { return $this->code; }
    public function setCode(?string $code): static { $this->code = $code; return $this; }
    public function getLigneStations(): Collection { return $this->ligneStations; }
    public function addLigneStation(LigneStation $ligneStation): static
    {
        if (!$this->ligneStations->contains($ligneStation)) {
            $this->ligneStations->add($ligneStation);
            $ligneStation->setLigne($this);
        }
        return $this;
    }
}
