<?php

namespace App\DataFixtures;

use App\Entity\Ligne;
use App\Entity\LigneStation;
use App\Entity\Station;
use App\Entity\Train;
use App\Entity\Trajet;
use App\Entity\Horaire;
use App\Entity\Personnel;
use App\Entity\Maintenance;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(private UserPasswordHasherInterface $hasher) {}

    /** @var array<string, Station> */
    private array $stations = [];

    public function load(ObjectManager $manager): void
    {
        $lignes = [
            [
                'nom' => 'Tunis - Tozeur',
                'code' => 'L5',
                'stations' => [
                    'Tunis Ville', 'Hammam Lif', 'Borj Cedria', 'Grombalia', 'Bou Argoub',
                    'Bir Bou Regba', 'Bouficha', 'Enfidha', 'Kalaa Kebira', 'Kalaa Seghira',
                    'Sousse', 'Messadine', 'Monastir', 'Mahdia', 'Kerker', 'El Jem',
                    'La Hencha', 'Sakiet Ezzit', 'Sfax', 'Maharès', 'Ghraiba', 'Gabes',
                    'Maknassy', 'Sened', 'Gafsa', 'Metlaoui', 'El Ouediene', 'Tozeur',
                ],
            ],
            [
                'nom' => 'Metlaoui - Redeyef',
                'code' => 'L5B',
                'stations' => [
                    'Metlaoui', 'Selja', 'Tabeddit 1er Arret', 'Tabeddit 2eme Arret',
                    'Moulares', 'El Ayoun', 'Magroun', 'Redeyef',
                ],
            ],
            [
                'nom' => 'Tunis - Annaba',
                'code' => 'TA',
                'stations' => [
                    'Tunis Ville', 'Manouba', 'Jedeida', 'Tebourba', 'Borj Toum',
                    'Mejez El Bab', 'Oued Zarga', "Sidi M'Himech", 'Beja', 'Mastouta',
                    "Sidi S'mail", 'Bou Salem', 'Ben Bechir', 'Jendouba', 'Oued Meliz',
                    'Ghardimaou', 'Souk Ahras', 'Annaba',
                ],
            ],
            [
                'nom' => 'Tunis - Bizerte',
                'code' => 'TB',
                'stations' => [
                    'Tunis Ville', 'Jedeida', 'Sidi Othman', 'Mateur', 'Ain Ghelal',
                    'Chaouat', 'Manouba', 'Tinja', 'La Pecherie', 'Bizerte',
                ],
            ],
            [
                'nom' => 'Tunis - Kalaa Khasba',
                'code' => 'L6',
                'stations' => [
                    'Tunis Ville', 'Jebel Jelloud', 'Bir Kassaa', 'Naassen', 'Khelidia',
                    'Oudna', 'Cheylus', "Bir M'Cherga", 'Depienne', 'Pont du Fahs',
                    'Bou Arada', 'El Aroussa', 'Sidi Ayed', 'Gaafour', 'El Akhouat',
                    'El Krib', 'Sidi Bou Rouis', 'Trika', 'Le Sers', 'Les Salines',
                    'Les Zouarines', 'Dahmani', 'Le Kef', 'Ain Mesria', 'Fej et Tameur',
                    'Gouraïa', 'Oued Sarrath', 'Kalaa Khasba',
                ],
            ],
            [
                'nom' => 'Tunis - Nabeul',
                'code' => 'TN',
                'stations' => [
                    'Tunis Ville', 'Borj Cedria', 'Grombalia', 'Foundouk Jedid', 'Bir Bou Regba',
                    'Omar Khayem', 'Belli', 'Hammamet', 'Bou Arkoub', 'Turki',
                    'Chaouat', 'Khanguet', "M'Razga", 'Nabeul',
                ],
            ],
        ];

        $ligneEntities = [];
        foreach ($lignes as $ligneDef) {
            $ligne = new Ligne();
            $ligne->setNom($ligneDef['nom']);
            $ligne->setCode($ligneDef['code']);
            $manager->persist($ligne);

            foreach ($ligneDef['stations'] as $i => $nom) {
                $station = $this->getOrCreateStation($manager, $nom);
                $ls = new LigneStation();
                $ls->setLigne($ligne);
                $ls->setStation($station);
                $ls->setOrdre($i + 1);
                $manager->persist($ls);
            }
            $ligneEntities[$ligneDef['code']] = $ligne;
        }

        $trains = [];
        $trainDefs = [
            ['TU-501', 'Express', 320],
            ['TU-502', 'Rapide', 280],
            ['TU-503', 'Express', 320],
            ['TU-504', 'Regional', 180],
            ['TU-505', 'Rapide', 280],
        ];
        foreach ($trainDefs as [$numero, $type, $capacite]) {
            $t = new Train();
            $t->setNumero($numero);
            $t->setType($type);
            $t->setCapacite($capacite);
            $manager->persist($t);
            $trains[] = $t;
        }

        $trajetDefs = [
            ['L5', 'Tunis Ville', 'Sousse', 140, 0, '07:25', '09:56', 'DC', "A l'heure"],
            ['L5', 'Sousse', 'Sfax', 130, 0, '10:11', '12:31', 'DC', "A l'heure"],
            ['L5', 'Sfax', 'Tozeur', 280, 1, '13:00', '18:30', 'DC', "A l'heure"],
            ['TA', 'Tunis Ville', 'Beja', 105, 2, '06:25', '08:54', 'AUT', "A l'heure"],
            ['TA', 'Beja', 'Annaba', 165, 2, '08:54', '18:20', 'DC', "A l'heure"],
            ['TB', 'Tunis Ville', 'Bizerte', 65, 3, '15:15', '18:01', 'DC', "A l'heure"],
            ['L6', 'Tunis Ville', 'Le Kef', 175, 4, '15:45', '19:11', 'EXP', "A l'heure"],
            ['TN', 'Tunis Ville', 'Nabeul', 65, 3, '13:50', '15:34', 'DC', "A l'heure"],
        ];

        foreach ($trajetDefs as [$ligneCode, $depNom, $arrNom, $distance, $trainIdx, $hDep, $hArr, $jours, $statut]) {
            $trajet = new Trajet();
            $trajet->setDistanceKm($distance);
            $trajet->setLigne($ligneEntities[$ligneCode]);
            $trajet->setStationDepart($this->stations[$depNom]);
            $trajet->setStationArrivee($this->stations[$arrNom]);
            $manager->persist($trajet);

            $horaire = new Horaire();
            $horaire->setTrain($trains[$trainIdx]);
            $horaire->setTrajet($trajet);
            $horaire->setHeureDepart(new \DateTime($hDep));
            $horaire->setHeureArrivee(new \DateTime($hArr));
            $horaire->setJours($jours);
            $horaire->setStatut($statut);
            $manager->persist($horaire);
        }

        $employeUser = new User();
        $employeUser->setEmail('employe@sncft.tn');
        $employeUser->setRoles(['ROLE_EMPLOYE']);
        $employeUser->setPassword($this->hasher->hashPassword($employeUser, 'Employe123!'));
        $manager->persist($employeUser);

        $personnelDefs = [
            ['Ben Salah', 'Karim', 'karim.bensalah@sncft.tn', 'Conducteur', $employeUser],
            ['Trabelsi', 'Nadia', 'nadia.trabelsi@sncft.tn', 'Controleur', null],
            ['Gharbi', 'Sami', 'sami.gharbi@sncft.tn', 'Agent Gare', null],
            ['Jaziri', 'Amel', 'amel.jaziri@sncft.tn', 'Chef de Gare', null],
        ];
        $personnels = [];
        foreach ($personnelDefs as [$nom, $prenom, $email, $role, $compte]) {
            $p = new Personnel();
            $p->setNom($nom);
            $p->setPrenom($prenom);
            $p->setEmail($email);
            $p->setRole($role);
            $p->setCompte($compte);
            $manager->persist($p);
            $personnels[] = $p;
        }

        $m1 = new Maintenance();
        $m1->setDescription('Revision moteur et freins');
        $m1->setDateDebut(new \DateTime('-3 days'));
        $m1->setDateFin(new \DateTime('-1 day'));
        $m1->setStatut('Terminee');
        $m1->setType('Preventive');
        $m1->setTrain($trains[0]);
        $m1->setPersonnel($personnels[0]);
        $manager->persist($m1);

        $m2 = new Maintenance();
        $m2->setDescription('Verification climatisation');
        $m2->setDateDebut(new \DateTime('+2 days'));
        $m2->setStatut('Planifiee');
        $m2->setType('Preventive');
        $m2->setTrain($trains[2]);
        $manager->persist($m2);

        $manager->flush();
    }

    private function getOrCreateStation(ObjectManager $manager, string $nom): Station
    {
        if (!isset($this->stations[$nom])) {
            $station = new Station();
            $station->setNom($nom);
            $station->setVille($nom);
            $manager->persist($station);
            $this->stations[$nom] = $station;
        }
        return $this->stations[$nom];
    }
}
