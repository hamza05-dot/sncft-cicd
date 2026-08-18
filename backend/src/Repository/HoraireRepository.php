<?php

namespace App\Repository;

use App\Entity\Horaire;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class HoraireRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Horaire::class);
    }

    public function findAllWithRelations(): array
    {
        return $this->createQueryBuilder('h')
            ->addSelect('t', 'tr', 'sd', 'sa')
            ->join('h.train', 't')
            ->join('h.trajet', 'tr')
            ->join('tr.stationDepart', 'sd')
            ->join('tr.stationArrivee', 'sa')
            ->getQuery()
            ->getResult();
    }

    public function findByLigne(int $ligneId): array
    {
        return $this->createQueryBuilder('h')
            ->addSelect('t', 'tr', 'sd', 'sa')
            ->join('h.train', 't')
            ->join('h.trajet', 'tr')
            ->join('tr.stationDepart', 'sd')
            ->join('tr.stationArrivee', 'sa')
            ->where('tr.ligne = :ligneId')
            ->setParameter('ligneId', $ligneId)
            ->orderBy('h.heureDepart', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByTrajet(int $departId, int $arriveeId): array
    {
        return $this->createQueryBuilder('h')
            ->addSelect('t', 'tr', 'sd', 'sa')
            ->join('h.train', 't')
            ->join('h.trajet', 'tr')
            ->join('tr.stationDepart', 'sd')
            ->join('tr.stationArrivee', 'sa')
            ->where('sd.id = :depart')
            ->andWhere('sa.id = :arrivee')
            ->setParameter('depart', $departId)
            ->setParameter('arrivee', $arriveeId)
            ->getQuery()
            ->getResult();
    }
}
