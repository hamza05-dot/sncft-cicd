<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class HoraireControllerTest extends WebTestCase
{
    public function testGetHoraires(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/horaires');

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
    }

    public function testGetStations(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/stations');

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
    }

    public function testGetTrains(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/trains');

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
    }

    public function testCreateTrainRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/trains', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode([
            'numero' => 'TU-999',
            'type' => 'Test',
            'capacite' => 100,
        ]));

        $this->assertResponseStatusCodeSame(401);
    }
}
