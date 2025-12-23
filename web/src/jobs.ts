export interface JobProps {
    name: string;
    icon: string;
}

export enum Job {
    RoleAny,
    RoleTank,
    RoleHealer,
    RoleSupport,
    RoleDps,
    RoleMelee,
    RoleRanged,
    RoleMagicRanged,
    RolePhysicalRanged,
    Paladin,
    Warrior,
    DarkKnight,
    Gunbreaker,
    WhiteMage,
    Scholar,
    Astrologian,
    Monk,
    Dragoon,
    Ninja,
    Viper,
    Reaper,
    Sage,
    Samurai,
    Bard,
    Machinist,
    Dancer,
    BlackMage,
    Summoner,
    RedMage,
    Pictomancer,
    BlueMage,
}

const JOBS: Record<Job, JobProps> = {
    [Job.RoleAny]: { name: 'Any player', icon: 'any.webp' },
    [Job.RoleTank]: { name: 'Tank', icon: 'tank.webp' },
    [Job.RoleHealer]: { name: 'Healer', icon: 'healer.webp' },
    [Job.RoleSupport]: { name: 'Support', icon: 'support.webp' },
    [Job.RoleDps]: { name: 'DPS', icon: 'dps.webp' },
    [Job.RoleMelee]: { name: 'Melee DPS', icon: 'melee.webp' },
    [Job.RoleRanged]: { name: 'Ranged DPS', icon: 'ranged.webp' },
    [Job.RoleMagicRanged]: { name: 'Magic Ranged DPS', icon: 'magic_ranged.webp' },
    [Job.RolePhysicalRanged]: { name: 'Physical Ranged DPS', icon: 'physical_ranged.webp' },
    [Job.Paladin]: { name: 'Paladin', icon: 'PLD.webp' },
    [Job.Warrior]: { name: 'Warrior', icon: 'WAR.webp' },
    [Job.DarkKnight]: { name: 'Dark Knight', icon: 'DRK.webp' },
    [Job.Gunbreaker]: { name: 'Gunbreaker', icon: 'GNB.webp' },
    [Job.WhiteMage]: { name: 'White Mage', icon: 'WHM.webp' },
    [Job.Scholar]: { name: 'Scholar', icon: 'SCH.webp' },
    [Job.Astrologian]: { name: 'Astrologian', icon: 'AST.webp' },
    [Job.Sage]: { name: 'Sage', icon: 'SGE.webp' },
    [Job.Monk]: { name: 'Monk', icon: 'MNK.webp' },
    [Job.Dragoon]: { name: 'Dragoon', icon: 'DRG.webp' },
    [Job.Ninja]: { name: 'Ninja', icon: 'NIN.webp' },
    [Job.Viper]: { name: 'Viper', icon: 'VPR.webp' },
    [Job.Reaper]: { name: 'Reaper', icon: 'RPR.webp' },
    [Job.Samurai]: { name: 'Samurai', icon: 'SAM.webp' },
    [Job.Bard]: { name: 'Bard', icon: 'BRD.webp' },
    [Job.Machinist]: { name: 'Machinist', icon: 'MCH.webp' },
    [Job.Dancer]: { name: 'Dancer', icon: 'DNC.webp' },
    [Job.BlackMage]: { name: 'Black Mage', icon: 'BLM.webp' },
    [Job.Summoner]: { name: 'Summoner', icon: 'SMN.webp' },
    [Job.RedMage]: { name: 'Red Mage', icon: 'RDM.webp' },
    [Job.Pictomancer]: { name: 'Pictomancer', icon: 'PCT.webp' },
    [Job.BlueMage]: { name: 'Blue Mage', icon: 'BLU.webp' },
};

export function getJob(job: Job): JobProps {
    const props = JOBS[job];
    if (props === undefined) {
        throw new Error('Unknown job');
    }

    return props;
}

export function getJobIconUrl(icon: string): string {
    return `/actor/${icon}`;
}
