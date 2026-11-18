<?php
namespace AuditRekamMedis\V1\Rest\AuditKelengkapan;

use Laminas\ApiTools\ApiProblem\ApiProblem;
use DBService\Resource;

class AuditKelengkapanResource extends Resource
{
    public function __construct() {
        parent::__construct();
        $this->service = new Service();
        $this->disconnectAfterRequest = false;
    }

    public function create($data)
    {
        return new ApiProblem(405, 'Method POST not supported');
    }

    public function delete($id)
    {
        return new ApiProblem(405, 'Method DELETE not supported');
    }

    public function deleteList($data)
    {
        return new ApiProblem(405, 'Method DELETE not supported');
    }

    public function fetch($id)
    {
        $data = $this->service->loadSingleVisitAudit($id);
        if (!$data) {
            return new ApiProblem(404, 'Data kunjungan tidak ditemukan');
        }
        return [
            "success" => true,
            "data" => $data
        ];
    }

    public function fetchAll($params = [])
    {
        $paramsArray = (array) $params;
        $result = $this->service->loadAuditData($paramsArray);

        return [
            "success" => true,
            "total" => $result['total'],
            "data" => $result['data'],
            "summary" => $result['summary']
        ];
    }

    public function patch($id, $data)
    {
        return new ApiProblem(405, 'Method PATCH not supported');
    }

    public function update($id, $data)
    {
        return new ApiProblem(405, 'Method PUT not supported');
    }
}
