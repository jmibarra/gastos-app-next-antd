// src/app/investments/page.tsx
"use client";
import React from "react";
import { Typography, Button } from "antd";
import { useRouter } from "next/navigation";
import Authenticated from "../authenticated/page";

const { Title, Paragraph } = Typography;

const Settings = () => {
    const router = useRouter();

    const handleGoBack = () => {
        router.push("/"); // Cambia esto a la ruta que desees
    };

    return (
        <Authenticated>
            <div style={{ padding: "20px" }}>
                <Title level={2}>Página de Inversiones</Title>
                <Paragraph>
                    Esta es una página de ejemplo para la configuración. Aquí se
                    mostrarán todos los detalles relacionados con configuración
                    de los elementos como estados y categorias
                </Paragraph>
                <Button type="primary" onClick={handleGoBack}>
                    Volver al inicio
                </Button>
            </div>
        </Authenticated>
    );
};

export default Settings;
