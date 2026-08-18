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

    /** @var array<string, Train> */
    private array $trainsByNumero = [];

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
            [
                // Simplified to major stops only — the official table has ~16 micro-stops
                // per direction, too dense to reliably hand-transcribe. See note in
                // loadEte2026Horaires() for confidence level on this line's times.
                'nom' => 'Banlieue Tunis - Erriadh',
                'code' => 'BER',
                'stations' => [
                    'Tunis Ville', 'Megrine', 'Rades', 'Ez-Zahra', 'Hammam Lif',
                    'Borj Cedria', 'Erriadh',
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

        // Placeholder trajets for L5 (Tozeur), TA (Annaba), TB (Bizerte), and L6 (Kef)
        // were removed here — real Ete 2026 horaires now cover those lignes (see
        // loadEte2026Horaires() below). TN (Nabeul) still needs real data, so its
        // placeholder trajet stays for now.
        $trajetDefs = [
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

        $this->loadEte2026Horaires($manager, $ligneEntities);

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

    private function getOrCreateTrain(ObjectManager $manager, string $numero, string $type = 'Grande Ligne', int $capacite = 300): Train
    {
        if (!isset($this->trainsByNumero[$numero])) {
            $train = new Train();
            $train->setNumero($numero);
            $train->setType($type);
            $train->setCapacite($capacite);
            $manager->persist($train);
            $this->trainsByNumero[$numero] = $train;
        }
        return $this->trainsByNumero[$numero];
    }

    /**
     * @param array<array{0:string,1:string}> $stops Ordered [stationName, "HH:MM"]
     *        pairs exactly as the train visits them (skipped stations simply
     *        aren't in the list). Creates one Trajet + Horaire per consecutive pair.
     */
    private function buildTrainLegs(ObjectManager $manager, Ligne $ligne, string $trainNumero, string $jours, array $stops): void
    {
        $train = $this->getOrCreateTrain($manager, $trainNumero);

        for ($i = 0; $i < count($stops) - 1; $i++) {
            [$depNom, $depTime] = $stops[$i];
            [$arrNom, $arrTime] = $stops[$i + 1];

            $trajet = new Trajet();
            $trajet->setLigne($ligne);
            $trajet->setStationDepart($this->getOrCreateStation($manager, $depNom));
            $trajet->setStationArrivee($this->getOrCreateStation($manager, $arrNom));
            $trajet->setDistanceKm(5.0); // placeholder — official table doesn't list per-hop distances

            $manager->persist($trajet);

            $horaire = new Horaire();
            $horaire->setTrain($train);
            $horaire->setTrajet($trajet);
            $horaire->setHeureDepart(\DateTime::createFromFormat('H:i', $depTime));
            $horaire->setHeureArrivee(\DateTime::createFromFormat('H:i', $arrTime));
            $horaire->setJours($jours);
            $horaire->setStatut("A l'heure");
            $manager->persist($horaire);
        }
    }

    /**
     * Real SNCFT "Ete 2026" timetable data, layered on top of the lignes/stations
     * already created above. Cells marked VERIFY were ambiguous in the source
     * table (merged bilingual columns / blank cells for skipped stations) —
     * double check those specific times against the official PDF at sncft.com.tn.
     */
    private function loadEte2026Horaires(ObjectManager $manager, array $ligneEntities): void
    {
        $tozeur = $ligneEntities['L5'];

        // --- Aller: Tunis -> Tozeur ---
        $this->buildTrainLegs($manager, $tozeur, '5-13/57', 'DC', [
            ['Tunis Ville', '07:25'], ['Hammam Lif', '07:55'], ['Grombalia', '08:19'],
            ['Bir Bou Regba', '08:38'], ['Bouficha', '08:53'], ['Enfidha', '09:08'],
            ['Kalaa Seghira', '09:35'], ['Sousse', '09:56'], ['Sousse', '10:11'],
            ['Messadine', '10:30'], ['El Jem', '11:22'], ['Sfax', '12:31'], ['Sfax', '13:00'],
            ['Maharès', '13:39'], ['Ghraiba', '14:00'], ['Metlaoui', '17:35'],
            ['El Ouediene', '18:18'], ['Tozeur', '18:30'],
        ]);
        $this->buildTrainLegs($manager, $tozeur, '5/73', 'DC', [
            ['Tunis Ville', '13:05'], ['Grombalia', '13:56'], ['Bir Bou Regba', '14:13'],
            ['Bouficha', '14:27'], ['Enfidha', '14:41'], ['Kalaa Seghira', '15:08'],
            ['Sousse', '15:23'], // VERIFY
            ['El Jem', '16:12'], ['La Hencha', '16:28'], ['Sfax', '17:17'], ['Sfax', '17:25'],
            ['Maharès', '18:00'], ['Ghraiba', '18:20'],
        ]);
        $this->buildTrainLegs($manager, $tozeur, '5/87', 'AUT', [
            ['Tunis Ville', '17:20'], ['Hammam Lif', '17:50'], ['Grombalia', '18:14'],
            ['Bir Bou Regba', '18:34'], ['Bouficha', '18:49'], ['Enfidha', '19:06'],
            ['Kalaa Seghira', '19:43'], ['Sousse', '19:55'], ['Sousse', '20:23'],
            ['El Jem', '21:13'], ['Sakiet Ezzit', '21:53'], ['Sfax', '22:18'], ['Sfax', '02:15'],
            ['Ghraiba', '03:09'], ['Gabes', '04:25'],
        ]);
        $this->buildTrainLegs($manager, $tozeur, '5/97', 'DC', [
            ['Tunis Ville', '21:15'], ['Bir Bou Regba', '22:24'], ['Sousse', '23:36'],
            ['Sousse', '23:50'], ['El Jem', '00:58'], ['Sfax', '01:57'], ['Maharès', '02:49'],
            ['Gabes', '04:25'],
        ]);

        // --- Retour: Tozeur -> Tunis ---
        // VERIFY: original source data for the Sousse -> Bir Bou Regba -> Grombalia
        // -> Tunis Ville tail of this train had times going backwards (transcription
        // error) — truncated at Sousse until confirmed against the official PDF.
        $this->buildTrainLegs($manager, $tozeur, '13-5/72', 'DC', [
            ['Tozeur', '06:00'], ['Metlaoui', '07:20'], ['Gafsa', '08:00'], ['Sened', '08:47'],
            ['Maknassy', '09:20'], ['Gabes', '10:50'], ['Sfax', '13:02'], ['Sfax', '13:25'],
            ['Sousse', '15:40'], ['Sousse', '15:55'],
        ]);

        // --- Ligne Tunis - Annaba (station names matched to AppFixtures spelling) ---
        $annaba = $ligneEntities['TA'];
        $this->buildTrainLegs($manager, $annaba, '7', 'AUT', [
            ['Tunis Ville', '06:25'], ['Manouba', '06:43'], ['Jedeida', '07:05'],
            ['Tebourba', '07:22'], ['Borj Toum', '07:44'], ['Mejez El Bab', '08:00'],
            ['Oued Zarga', '08:19'], ["Sidi M'Himech", '08:39'], ['Beja', '08:54'],
            ['Mastouta', '09:07'], ["Sidi S'mail", '09:16'], ['Bou Salem', '09:32'],
            ['Ben Bechir', '09:45'], ['Jendouba', '09:58'], ['Oued Meliz', '10:18'],
            ['Ghardimaou', '10:26'],
        ]);
        $this->buildTrainLegs($manager, $annaba, 'TM1(A)', 'DC', [
            ['Tunis Ville', '08:25'], ['Beja', '10:39'], ['Jendouba', '11:36'],
            ['Ghardimaou', '12:03'], ['Ghardimaou', '13:30'],
            ['Souk Ahras', '14:47'], ['Souk Ahras', '15:45'],
            ['Annaba', '18:20'],
        ]);
        $this->buildTrainLegs($manager, $annaba, '8', 'DC', [
            ['Ghardimaou', '04:25'], ['Oued Meliz', '04:34'], ['Jendouba', '04:53'],
            ['Ben Bechir', '05:05'], ['Bou Salem', '05:18'], ["Sidi S'mail", '05:33'],
            ['Mastouta', '05:42'], ['Beja', '05:56'], ["Sidi M'Himech", '06:12'],
            ['Oued Zarga', '06:29'], ['Mejez El Bab', '06:46'], ['Borj Toum', '07:01'],
            ['Tebourba', '07:21'], ['Jedeida', '07:35'], ['Manouba', '07:58'],
            ['Tunis Ville', '08:17'],
        ]);

        $this->buildTrainLegs($manager, $annaba, '12', 'DC', [
            ['Ghardimaou', '08:35'], ['Oued Meliz', '08:44'], ['Jendouba', '09:05'],
            ['Ben Bechir', '09:17'], ['Bou Salem', '09:31'], ["Sidi S'mail", '09:46'],
            ['Mastouta', '09:55'], ['Beja', '10:08'], ["Sidi M'Himech", '10:26'],
            ['Oued Zarga', '10:45'], ['Mejez El Bab', '11:03'], ['Borj Toum', '11:19'],
            ['Tebourba', '11:41'], ['Jedeida', '11:54'], ['Manouba', '12:21'],
            ['Tunis Ville', '12:40'],
        ]); // VERIFY: some intermediate cells were ambiguous in source table

        $this->buildTrainLegs($manager, $annaba, '14', 'AUT', [
            ['Ghardimaou', '12:10'], ['Oued Meliz', '12:19'], ['Jendouba', '12:40'],
            ['Ben Bechir', '12:52'], ['Bou Salem', '13:05'], ["Sidi S'mail", '13:20'],
            ['Mastouta', '13:29'], ['Beja', '13:42'], ["Sidi M'Himech", '13:58'],
            ['Tunis Ville', '16:04'],
        ]); // VERIFY: several intermediate stops omitted, column data unclear — large time gap

        $this->buildTrainLegs($manager, $annaba, 'TM2(B)', 'DC', [
            ['Annaba', '09:00'], ['Souk Ahras', '11:10'], ['Souk Ahras', '12:10'],
            ['Ghardimaou', '13:21'], ['Ghardimaou', '14:50'], ['Jendouba', '15:18'],
            ['Beja', '16:17'], ['Tunis Ville', '18:30'],
        ]); // VERIFY: Jendouba/Beja intermediate times uncertain, endpoints solid

        // --- Ligne Tunis - Bizerte (remapped to AppFixtures' 10-station order) ---
        // VERIFY: AppFixtures orders this Tunis Ville / Jedeida / Sidi Othman / Mateur /
        // Ain Ghelal / Chaouat / Manouba / Tinja / La Pecherie / Bizerte — Manouba
        // appearing this late looked geographically odd, worth a PDF check.
        $bizerte = $ligneEntities['TB'];
        $this->buildTrainLegs($manager, $bizerte, '1/19', 'DC', [
            ['Tunis Ville', '15:15'], ['Jedeida', '15:38'], ['Sidi Othman', '16:00'],
            ['Mateur', '16:09'], ['Ain Ghelal', '16:21'], ['Chaouat', '16:40'],
            ['Manouba', '17:03'], ['Tinja', '17:28'], ['La Pecherie', '17:53'],
            ['Bizerte', '18:01'],
        ]);
        $this->buildTrainLegs($manager, $bizerte, '1/4(A)', 'DC', [
            ['Bizerte', '05:00'], ['La Pecherie', '05:09'], ['Tinja', '05:34'],
            ['Manouba', '06:02'], ['Chaouat', '06:28'], ['Ain Ghelal', '06:48'],
            ['Mateur', '07:02'], ['Sidi Othman', '07:13'], ['Jedeida', '07:34'],
        ]);

        $this->buildTrainLegs($manager, $bizerte, '1/10(B)', 'DC', [
            ['Bizerte', '06:50'], ['Tinja', '06:59'], ['Ain Ghelal', '07:24'],
            ['Chaouat', '07:52'], ['Mateur', '08:18'], ['Sidi Othman', '08:38'],
            ['Jedeida', '08:52'], ['Manouba', '09:04'], ['Tunis Ville', '09:26'],
        ]);

        // --- Ligne Tunis - Kalaa Khasba (Le Kef) — AppFixtures' full 28-station list ---
        $kef = $ligneEntities['L6'];
        $this->buildTrainLegs($manager, $kef, '6/51', 'DC', [
            ['Tunis Ville', '05:55'], ['Jebel Jelloud', '06:09'], ['Bir Kassaa', '06:21'],
            ['Naassen', '06:32'], ['Khelidia', '06:43'], ['Oudna', '06:48'],
            ['Cheylus', '06:58'], ["Bir M'Cherga", '07:07'], ['Depienne', '07:17'],
            ['Pont du Fahs', '07:32'], ['Bou Arada', '07:54'], ['El Aroussa', '08:10'],
            ['Sidi Ayed', '08:21'], ['Gaafour', '08:33'], ['El Akhouat', '08:45'],
            ['El Krib', '08:57'], ['Sidi Bou Rouis', '09:10'], ['Trika', '09:21'],
            ['Le Sers', '09:37'], ['Les Salines', '09:44'], ['Les Zouarines', '09:55'],
            ['Dahmani', '10:06'],
            ['Ain Mesria', '10:21'], ['Fej et Tameur', '10:32'], ['Gouraïa', '10:45'],
            ['Oued Sarrath', '10:56'], ['Kalaa Khasba', '11:13'],
        ]);
        $this->buildTrainLegs($manager, $kef, '6-8/69', 'EXP', [
            ['Tunis Ville', '15:45'], ['Bir Kassaa', '16:07'], ['Naassen', '16:15'],
            ['Cheylus', '16:32'], ["Bir M'Cherga", '16:40'], ['Depienne', '16:48'],
            ['Pont du Fahs', '17:00'], ['Bou Arada', '17:18'], ['El Aroussa', '17:32'],
            ['Gaafour', '17:48'], ['Sidi Bou Rouis', '18:16'], ['Le Sers', '18:35'],
            ['Le Kef', '19:11'],
        ]);
        $this->buildTrainLegs($manager, $kef, '6/76', 'DC', [
            ['Kalaa Khasba', '12:45'], ['Oued Sarrath', '13:03'], ['Gouraïa', '13:14'],
            ['Fej et Tameur', '13:27'], ['Ain Mesria', '13:38'], ['Le Kef', '13:53'],
            ['Dahmani', '14:04'], ['Les Zouarines', '14:15'], ['Les Salines', '14:22'],
            ['Le Sers', '14:38'], ['Sidi Bou Rouis', '14:49'], ['El Krib', '15:02'],
            ['El Akhouat', '15:14'], ['Gaafour', '15:27'], ['Sidi Ayed', '15:38'],
            ['El Aroussa', '15:50'], ['Bou Arada', '16:10'], ['Pont du Fahs', '16:32'],
            ['Depienne', '16:47'], ["Bir M'Cherga", '16:55'], ['Cheylus', '17:04'],
            ['Oudna', '17:14'], ['Naassen', '17:29'], ['Bir Kassaa', '17:38'],
            ['Jebel Jelloud', '17:48'], ['Tunis Ville', '18:00'],
        ]);

        $this->buildTrainLegs($manager, $kef, '8-6/54', 'EXP', [
            ['Le Sers', '05:37'], ['Sidi Bou Rouis', '05:57'], ['Gaafour', '06:26'],
            ['El Aroussa', '06:38'], ['Bou Arada', '06:48'], ['Pont du Fahs', '07:04'],
            ["Bir M'Cherga", '07:24'], ['Cheylus', '07:32'], ['Naassen', '07:49'],
            ['Bir Kassaa', '07:59'], ['Tunis Ville', '08:18'],
        ]); // VERIFY: origin point (Le Kef vs Kalaa Khasba) unclear in source table

        $this->buildTrainLegs($manager, $kef, '6/50', 'DC', [
            ['Dahmani', '03:00'], ['Les Zouarines', '03:11'], ['Les Salines', '03:22'],
            ['Le Sers', '03:29'], ['Trika', '03:44'], ['Sidi Bou Rouis', '03:55'],
            ['El Krib', '04:08'], ['El Akhouat', '04:20'], ['Gaafour', '04:33'],
            ['Sidi Ayed', '04:44'], ['El Aroussa', '04:55'], ['Bou Arada', '05:11'],
            ['Pont du Fahs', '05:33'], ['Depienne', '05:48'], ["Bir M'Cherga", '05:56'],
            ['Cheylus', '06:05'], ['Oudna', '06:15'], ['Khelidia', '06:20'],
            ['Naassen', '06:31'], ['Bir Kassaa', '06:40'], ['Jebel Jelloud', '06:50'],
            ['Tunis Ville', '07:02'],
        ]); // VERIFY: origin point (Le Kef vs Kalaa Khasba) unclear in source table

        // --- Ligne Banlieue Tunis - Erriadh ---
        // LOWER CONFIDENCE: this is a representative subset (~18 of ~130 daily
        // trains), using only the major stops. Intermediate times on this ultra-dense
        // commuter table are the least certain of anything transcribed this session —
        // spot-check a few against the PDF before relying on this for a demo/grade.
        $erriadh = $ligneEntities['BER'];

        $erriadhAllerTrains = [
            ['102', '04:25', '04:45', '04:52', '04:59', '05:04', '05:23'],
            ['110', '05:40', '05:57', '06:03', '06:10', '06:15', '06:33'],
            ['118', '06:15', '06:29', '06:34', '06:40', '06:44', '06:59'],
            ['130', '07:15', '07:29', '07:35', '07:41', '07:46', '08:02'],
            ['140', '08:15', '08:28', '08:34', '08:40', '08:44', '08:59'],
            ['150', '09:10', '09:24', '09:29', '09:35', '09:39', '09:57'],
            ['165', '10:15', '10:28', '10:34', '10:40', '10:44', '10:59'],
            ['180', '12:05', '12:19', '12:24', '12:30', '12:34', '12:47'],
            ['195', '13:20', '13:34', '13:39', '13:45', '13:49', '14:04'],
            ['210', '14:45', '14:59', '15:04', '15:10', '15:14', '15:29'],
        ];
        foreach ($erriadhAllerTrains as [$num, $erriadh_t, $borjCedria_t, $hammamLif_t, $ezZahra_t, $rades_t, $tunis_t]) {
            $this->buildTrainLegs($manager, $erriadh, $num, 'A', [
                ['Erriadh', $erriadh_t], ['Borj Cedria', $borjCedria_t], ['Hammam Lif', $hammamLif_t],
                ['Ez-Zahra', $ezZahra_t], ['Rades', $rades_t], ['Tunis Ville', $tunis_t],
            ]);
        }

        $erriadhRetourTrains = [
            ['101', '04:30', '04:48', '04:52', '04:57', '05:04', '05:23'],
            ['111', '06:00', '06:18', '06:22', '06:27', '06:34', '06:52'],
            ['121', '07:00', '07:18', '07:22', '07:27', '07:34', '07:52'],
            ['135', '08:00', '08:18', '08:22', '08:27', '08:34', '08:52'],
            ['147', '09:00', '09:18', '09:22', '09:27', '09:34', '09:52'],
            ['159', '10:00', '10:18', '10:22', '10:27', '10:34', '10:52'],
            ['171', '11:00', '11:18', '11:22', '11:27', '11:34', '11:52'],
            ['183', '12:41', '12:59', '13:03', '13:08', '13:15', '13:32'],
        ];
        foreach ($erriadhRetourTrains as [$num, $tunis_t, $rades_t, $ezZahra_t, $hammamLif_t, $borjCedria_t, $erriadh_t]) {
            $this->buildTrainLegs($manager, $erriadh, $num, 'A', [
                ['Tunis Ville', $tunis_t], ['Rades', $rades_t], ['Ez-Zahra', $ezZahra_t],
                ['Hammam Lif', $hammamLif_t], ['Borj Cedria', $borjCedria_t], ['Erriadh', $erriadh_t],
            ]);
        }
    }
}
