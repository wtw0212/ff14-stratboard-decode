/**
 * Temporary test script to decode and compare strategy codes
 * Run with: npx ts-node test_rotation.ts
 */

import { decodeStrategy } from './src/file/gameStrategyCodec';

const codes = {
    exported: '[stgy:a3HXo047fTvIBSxP9tLmmjrWBRuLJMuJcg7jI+qawfaY3Qbe7mZAeb1QuLaDUCuW5w+QP+eq62hyfv4mQjLZQyqV-maSq8U7JzUhFzypzQnZSz6EFJ7WPMQJ1GezLQkM4]',
    ingameBroken: '[stgy:aCS3knr9O2DWiZT14IcFFfeaipJcL6JL5Y9fWvGBUOB0CEmo9FbMomAEJcB7VzJawUvE1voG8QthODrFEfcbEhGNsFBZG-V9LyVtXyhdyEqbZy8jXL9a16ELAPoycEg6r]',
    ingameFixed: '[stgy:azpGjAUIuQ7aKb2ArW5XXOoBKdL5c8Lcw04OaDPiVuinzjFk4Xm6kFMjL5i9NyLBUVDjADiPFEV5bi-ljnd5U-hNfiiOLtzKwxcvvRKVSzetDJk6wWvRzilrKCk6KDo+fk]'
};

function hexDump(data: Uint8Array): string {
    return Array.from(data).map(b => b.toString(16).padStart(2, '0')).join(' ');
}

for (const [name, code] of Object.entries(codes)) {
    console.log(`\n=== ${name} ===`);
    try {
        const binary = decodeStrategy(code);
        console.log(`Binary length: ${binary.length}`);
        console.log(`Hex: ${hexDump(binary)}`);

        // Find ANGLE block (0x06 0x00)
        for (let i = 0; i < binary.length - 4; i++) {
            if (binary[i] === 0x06 && binary[i + 1] === 0x00) {
                console.log(`ANGLE block at offset ${i}:`);
                console.log(`  Header: ${hexDump(binary.slice(i, i + 6))}`);
                const count = binary[i + 4]! + (binary[i + 5]! << 8);
                console.log(`  Count: ${count}`);
                const angleData = binary.slice(i + 6, i + 6 + (count * 2));
                console.log(`  Angles (raw): ${hexDump(angleData)}`);
                for (let j = 0; j < count; j++) {
                    const lo = angleData[j * 2]!;
                    const hi = angleData[j * 2 + 1]!;
                    const rawAngle = lo + (hi << 8);
                    const signedAngle = rawAngle > 32767 ? rawAngle - 65536 : rawAngle;
                    console.log(`  Angle[${j}]: raw=${rawAngle} (0x${rawAngle.toString(16)}), signed=${signedAngle}°`);
                }
                break;
            }
        }
    } catch (e) {
        console.log(`Error: ${e}`);
    }
}
