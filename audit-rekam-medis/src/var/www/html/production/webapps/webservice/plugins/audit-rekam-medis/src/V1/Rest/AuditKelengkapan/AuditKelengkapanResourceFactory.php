<?php
namespace AuditRekamMedis\V1\Rest\AuditKelengkapan;

class AuditKelengkapanResourceFactory
{
    public function __invoke($services)
    {
        $obj = new AuditKelengkapanResource();
        $obj->setServiceManager($services);
        return $obj;
    }
}
