// utils/preSpeech.ts
export function preSpeech(text: string): string {
    const dictionary: Record<string, string> = {
        Kamenge: "kameingue",
        Ntahangwa: "Néta han goua",
        Bujumbura: "Bou-joum-bou-la",
        Burundi: "Bou-lun-di",
        Cibitoke: "Cibi-toké",
        Gihosha: "Guiho-cha",
        Kinama: "q-nama",
        Ngagara: "Ngagala",
        Buterere: "Butelele",
        "Centre Jeunes Kamenge": "Centre Jeunes Kamenge",
        "Archidiocèse de Bujumbura": "Archidiocèse de Bou-joum-bou-la",
        "Missionnaires Xavériens": "Missionnaires Xavériens",
        "Prêtres diocésains": "Prêtres diocésains",
        "Œuvres sociales": "Œuvres sociales",
        "formation des jeunes": "formation des jeunes",
        "promotion de la paix": "promotion de la paix",
        "cadre de rencontre": "cadre de rencontre",
        "dialogue, de formation et de promotion de la paix": "dialogue, de formation et de promotion de la paix",
        "structure éducative, formative, récréative, sportive et de rencontres": "structure éducative, formative, récréative, sportive et de rencontres",
        "sans distinction d'origine ethnique, de sexe ou de religion": "sans distinction d'origine ethnique, de sexe ou de religion",
        "tensions sociales et politiques": "tensions sociales et politiques",
        "cadre de rencontre, de dialogue, de formation et de promotion de la paix": "cadre de rencontre, de dialogue, de formation et de promotion de la paix",
        "équipe de Prêtres diocésains nommés par l’archevêque": "équipe de Prêtres diocésains nommés par l’archevêque",
        "groupe cible actuel": "groupe cible actuel",
        "inscrit dans ses registres d'adhésion": "inscrit dans ses registres d'adhésion",
    };

    return Object.entries(dictionary).reduce(
        (acc, [word, pronunciation]) =>
            acc.replace(new RegExp(`\\b${word}\\b`, "gi"), pronunciation),
        text
    );
}
