'use client';

import { useState } from 'react';
import { preSpeech } from "./preSpeech";

function speak(text: string) {
    const utterance = new SpeechSynthesisUtterance(preSpeech(text));
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

export default function ReadButton() {
    const [isPlaying, setIsPlaying] = useState(false);

    const toggleSpeech = () => {
        if (isPlaying) {
            speechSynthesis.pause();
            setIsPlaying(false);
        } else {
            if (speechSynthesis.paused) {
                speechSynthesis.resume();
            } else {
                speak(`
c'est quoi le CJK?
Le Centre Jeunes Kamenge est l'un des grands centres sociaux de la commune de Ntahangwa, en mairie de Bujumbura, au Burundi.

C'est une structure éducative, formative, récréative et culturelle, ouverte aux jeunes sans distinction d'origine ethnique, de sexe ou de religion.

Créé en 1992, le Centre est né dans un contexte marqué par des tensions sociales et politiques. Il avait pour objectif principal d'offrir aux jeunes un cadre de rencontre, de dialogue, de formation et de promotion de la paix.

Depuis juin 2015, la gestion est assurée par une équipe de laïcs burundais, nommés par l'Archevêque de Bujumbura, pour poursuivre et renforcer la mission du Centre.
        `);
            }
            setIsPlaying(true);
        }
    };

    return (
        <button
            onClick={toggleSpeech}
            className="px-4 py-2 bg-orange-500 text-white rounded"
        >
            {isPlaying ? 'Pause' : 'Lire le texte'}
        </button>
    );
}
