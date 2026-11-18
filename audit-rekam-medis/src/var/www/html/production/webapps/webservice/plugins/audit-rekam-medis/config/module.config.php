<?php
return [
    'service_manager' => [
        'factories' => [
            \AuditRekamMedis\V1\Rest\AuditKelengkapan\AuditKelengkapanResource::class => \AuditRekamMedis\V1\Rest\AuditKelengkapan\AuditKelengkapanResourceFactory::class,
        ],
    ],
    'router' => [
        'routes' => [
            'audit-rekam-medis.rest.audit-kelengkapan' => [
                'type' => 'Segment',
                'options' => [
                    'route' => '/auditrekammedis/kelengkapan[/:id]',
                    'defaults' => [
                        'controller' => 'AuditRekamMedis\\V1\\Rest\\AuditKelengkapan\\Controller',
                    ],
                ],
            ],
        ],
    ],
    'api-tools-versioning' => [
        'uri' => [
            0 => 'audit-rekam-medis.rest.audit-kelengkapan',
        ],
    ],
    'api-tools-rest' => [
        'AuditRekamMedis\\V1\\Rest\\AuditKelengkapan\\Controller' => [
            'listener' => \AuditRekamMedis\V1\Rest\AuditKelengkapan\AuditKelengkapanResource::class,
            'route_name' => 'audit-rekam-medis.rest.audit-kelengkapan',
            'route_identifier_name' => 'id',
            'collection_name' => 'audit_kelengkapan',
            'entity_http_methods' => [
                0 => 'GET',
            ],
            'collection_http_methods' => [
                0 => 'GET',
            ],
            'collection_query_whitelist' => [
                'tanggal_awal',
                'tanggal_akhir',
                'jenis_kunjungan',
                'ruangan',
                'dpjp',
                'status_filter',
                'query',
                'page',
                'start',
                'limit',
            ],
            'page_size' => 25,
            'page_size_param' => 'limit',
            'entity_class' => \AuditRekamMedis\V1\Rest\AuditKelengkapan\AuditKelengkapanEntity::class,
            'collection_class' => \AuditRekamMedis\V1\Rest\AuditKelengkapan\AuditKelengkapanCollection::class,
            'service_name' => 'AuditKelengkapan',
        ],
    ],
    'api-tools-content-negotiation' => [
        'controllers' => [
            'AuditRekamMedis\\V1\\Rest\\AuditKelengkapan\\Controller' => 'Json',
        ],
        'accept_whitelist' => [
            'AuditRekamMedis\\V1\\Rest\\AuditKelengkapan\\Controller' => [
                0 => 'application/vnd.audit-rekam-medis.v1+json',
                1 => 'application/hal+json',
                2 => 'application/json',
            ],
        ],
        'content_type_whitelist' => [
            'AuditRekamMedis\\V1\\Rest\\AuditKelengkapan\\Controller' => [
                0 => 'application/vnd.audit-rekam-medis.v1+json',
                1 => 'application/json',
            ],
        ],
    ],
    'api-tools-hal' => [
        'metadata_map' => [
            \AuditRekamMedis\V1\Rest\AuditKelengkapan\AuditKelengkapanEntity::class => [
                'entity_identifier_name' => 'id',
                'route_name' => 'audit-rekam-medis.rest.audit-kelengkapan',
                'route_identifier_name' => 'id',
                'hydrator' => \Laminas\Hydrator\ArraySerializableHydrator::class,
            ],
            \AuditRekamMedis\V1\Rest\AuditKelengkapan\AuditKelengkapanCollection::class => [
                'entity_identifier_name' => 'id',
                'route_name' => 'audit-rekam-medis.rest.audit-kelengkapan',
                'route_identifier_name' => 'id',
                'is_collection' => true,
            ],
        ],
    ],
];
