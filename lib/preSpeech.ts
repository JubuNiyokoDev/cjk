// utils/preSpeech.ts
export function preSpeech(text: string): string {
    const dictionary: Record<string, string> = {
        Kamenge: "kameingue",
        Ntahangwa: "Néta han goua",
        Bujumbura: "Bou-joum-bou-la",
        Burundi: "Bou-lun-di",
    };

    return Object.entries(dictionary).reduce(
        (acc, [word, pronunciation]) =>
            acc.replace(new RegExp(`\\b${word}\\b`, "gi"), pronunciation),
        text
    );
}
