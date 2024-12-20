import promptSync from 'prompt-sync';
class GameLogger {

    private static instance: GameLogger | null = null;


    private constructor() {}

    public static getInstance(): GameLogger {
        if (GameLogger.instance === null) {
            GameLogger.instance = new GameLogger();
        }
        return GameLogger.instance;
    }

    public log(message: string): void {
        console.log(`[GAME LOG]: ${message}`);
    }

    
}

const logger = GameLogger.getInstance();
logger.log("Игра началась!");

const logger2 = GameLogger.getInstance();
console.log(logger === logger2); 


abstract class Enemy {

    protected name: String;
    protected health: number;
    protected damage: number;


    constructor(name: string, health: number, damage: number) {
        this.name = name;
        this.health = health;
        this.damage = damage;
    }

    public getName(): String{
        return this.name;
    }
    
    public getHealth(): number{
        return this.health;
    }

    public abstract takeDamage(damage: number): void;
    public abstract attack(player: PlayableCharacter): void;

    public isAlive(): boolean {
        return this.health > 0;
    }
}

interface PlayableCharacter {
    getName(): string;
    takeDamage(damage: number): void;
    isAlive(): boolean;
}

export interface Weapon{

    getDamage(): number;
    use(): void;

}

export interface Armor {

    getDefense(): number;
    use(): void;

}

enum CharacterClass {
    WARRIOR = "WARRIOR",
    THIEF = "THIEF",
    MAGE = "MAGE",
    ROGUE = "ROGUE"
}

class CharacterClassDetails {
    private static readonly healthMap: Record<CharacterClass, number> = {
        [CharacterClass.WARRIOR]: 100,
        [CharacterClass.THIEF]: 90,
        [CharacterClass.MAGE]: 80,
        [CharacterClass.ROGUE]: 10,
    };

    public static getStartingHealth(characterClass: CharacterClass): number {
        return this.healthMap[characterClass];
    }
}

class PlayableCharacter {
    private logger: GameLogger;
    private name: string;
    private characterClass: CharacterClass;
    private weapon: Weapon;
    private armor: Armor;
    private health: number;

    constructor(
        name: string,
        characterClass: CharacterClass,
        weapon: Weapon,
        armor: Armor
    ) {
        this.logger = GameLogger.getInstance();
        this.name = name;
        this.characterClass = characterClass;
        this.weapon = weapon;
        this.armor = armor;
        this.health = CharacterClassDetails.getStartingHealth(this.characterClass);
    }

    public takeDamage(damage: number): void {
        const reducedDamage = Math.max(0, Math.round(damage * (1 - this.armor.getDefense())));
        this.health -= reducedDamage;

        this.armor.use();
        this.logger.log(`${this.name} получил урон: ${reducedDamage}`);

        if (this.health > 0) {
            this.logger.log(`${this.name} осталось ${this.health} здоровья`);
        }
    }

    public attack(enemy: Enemy): void {
        this.logger.log(`${this.name} атакует врага ${enemy.getName()}`);
        this.weapon.use();
        enemy.takeDamage(this.weapon.getDamage());
    }

    public isAlive(): boolean {
        return this.health > 0;
    }

    public getName(): string {
        return this.name;
    }
}

class PlayableCharacterBuilder {
    private name?: string;
    private characterClass?: CharacterClass;
    private weapon?: Weapon;
    private armor?: Armor;

    public setName(name: string): this {
        this.name = name;
        return this;
    }

    public setCharacterClass(characterClass: CharacterClass): this {
        this.characterClass = characterClass;
        return this;
    }

    public setWeapon(weapon: Weapon): this {
        this.weapon = weapon;
        return this;
    }

    public setArmor(armor: Armor): this {
        this.armor = armor;
        return this;
    }

    public build(): PlayableCharacter {
        if (!this.name || !this.characterClass || !this.weapon || !this.armor) {
            throw new Error("Все поля должны быть заполнены перед созданием персонажа.");
        }
        return new PlayableCharacter(this.name, this.characterClass, this.weapon, this.armor);
    }
}

class Sword implements Weapon {
    private damage: number;
    private logger: GameLogger;

    constructor() {
        this.damage = 20;
        this.logger = GameLogger.getInstance();
    }

    public getDamage(): number {
        return this.damage;
    }

    public use(): void {
        this.logger.log("Удар мечом!");
    }
}

class Bow implements Weapon {
    private damage: number;
    private criticalChance: number;
    private criticalModifier: number;
    private logger: GameLogger;

    constructor() {
        this.damage = 15;
        this.criticalChance = 0.3;
        this.criticalModifier = 2;
        this.logger = GameLogger.getInstance();
    }

    public getDamage(): number {
        const roll = Math.random();
        if (roll <= this.criticalChance) {
            this.logger.log("Критический урон!");
            return this.damage * this.criticalModifier;
        }
        return this.damage;
    }

    public use(): void {
        this.logger.log("Выстрел из лука!");
    }
}

class Staff implements Weapon {
    private damage: number;
    private scatter: number;
    private logger: GameLogger;

    constructor() {
        this.damage = 25;
        this.scatter = 0.2;
        this.logger = GameLogger.getInstance();
    }

    public getDamage(): number {
        const roll = Math.random();
        const factor = 1 + (roll * 2 * this.scatter - this.scatter);
        return Math.round(this.damage * factor);
    }

    public use(): void {
        this.logger.log("Воздух накаляется, из посоха вылетает огненный шар!");
    }
}

class HeavyArmor implements Armor {
    private defense: number;
    private logger: GameLogger;

    constructor() {
        this.defense = 0.3;
        this.logger = GameLogger.getInstance();
    }

    public getDefense(): number {
        return this.defense;
    }

    public use(): void {
        this.logger.log("Тяжелая броня блокирует значительную часть урона");
    }
}

class LightArmor implements Armor {
    private defense: number;
    private logger: GameLogger;

    constructor() {
        this.defense = 0.2;
        this.logger = GameLogger.getInstance();
    }

    public getDefense(): number {
        return this.defense;
    }

    public use(): void {
        this.logger.log("Легкая броня блокирует урон");
    }
}

class Robe implements Armor {
    private defense: number;
    private logger: GameLogger;

    constructor() {
        this.defense = 0.1;
        this.logger = GameLogger.getInstance();
    }

    public getDefense(): number {
        return this.defense;
    }

    public use(): void {
        this.logger.log("Роба блокирует немного урона");
    }
}

export interface EquipmentChest {

    getWeapon(): Weapon;
    getArmor(): Armor;

}

class WarriorEquipmentChest implements EquipmentChest {

    public getWeapon(): Weapon {
        return new Sword();
    }

    public getArmor(): Armor {
        return new HeavyArmor();
    }

}

class MagicalEquipmentChest implements EquipmentChest {
    public getWeapon(): Weapon {
        return new Staff();
    }

    public getArmor(): Armor {
        return new Robe();
    }
}

class ThiefEquipmentChest implements EquipmentChest {
    public getWeapon(): Weapon {
        return new Bow();
    }

    public getArmor(): Armor {
        return new LightArmor();
    }
}

class RogueEquipmentChest implements EquipmentChest {
    public getWeapon(): Weapon {
        return new Bow();
    }

    public getArmor(): Armor {
        return new LightArmor();
    }
}

export interface Location {

    spawnEnemy(): Enemy

}

export class Goblin extends Enemy {
    private logger: GameLogger;

    constructor() {
        super("Гоблин", 50, 10);
        this.logger = GameLogger.getInstance();
        this.name = "Гоблин";
        this.health = 50;
        this.damage = 10;
    }

    public takeDamage(damage: number): void {
        this.logger.log(`${this.name} получает ${damage} урона!`);
        this.health -= damage;
        if (this.health > 0) {
            this.logger.log(`У ${this.name} осталось ${this.health} здоровья`);
        }
    }

    public attack(player: PlayableCharacter): void {
        this.logger.log(`${this.name} атакует ${player.getName()}!`);
        player.takeDamage(this.damage);
    }
}


export class Dragon extends Enemy {
    private readonly gameLogger: GameLogger;
    private resistance: number;

    constructor() {
        super("Дракон", 100, 30);
        this.gameLogger = GameLogger.getInstance();
        this.name = "Дракон";
        this.resistance = 0.2;
        this.health = 100;
        this.damage = 30;
    }

    public takeDamage(damage: number): void {
        damage = Math.round(damage * (1 - this.resistance));
        this.gameLogger.log(`${this.name} получает ${damage} урона!`);
        this.health -= damage;
        if (this.health > 0) {
            this.gameLogger.log(`У ${this.name} осталось ${this.health} здоровья`);
        }
    }

    public attack(player: PlayableCharacter): void {
        this.gameLogger.log("Дракон дышит огнем!");
        player.takeDamage(this.damage);
    }
}

export class Forest implements Location {

    public spawnEnemy(): Enemy {
        return new Goblin();
    }

}

export class DragonBarrow implements Location {

    public spawnEnemy(): Enemy {
        return new Dragon();
    }

}

export class HauntedHouse implements Location {

    public spawnEnemy(): Enemy {
        return new Dragon();
    }

}

const prompt = promptSync();
const gameLogger = GameLogger.getInstance();

function main() {
    console.log("Создайте своего персонажа:");

    const name = prompt("Введите имя: ");
    const classOptions = Object.keys(CharacterClass);
    console.log(`Выберите класс из списка: ${classOptions.join(', ')}`);
    const characterClassInput = prompt("Введите класс: ");
    const characterClass = CharacterClass[characterClassInput as keyof typeof CharacterClass];

    const startingEquipmentChest = getChest(characterClass);
    const startingArmor = startingEquipmentChest.getArmor();
    const startingWeapon = startingEquipmentChest.getWeapon();

    const player = new PlayableCharacterBuilder()
        .setName(name)
        .setCharacterClass(characterClass)
        .setArmor(startingArmor)
        .setWeapon(startingWeapon)
        .build();

    gameLogger.log(`${player.getName()} очнулся на распутье!`);

    console.log("Куда вы двинетесь? Выберите локацию: (мистический лес, логово дракона, проклятый дом)");
    const locationName = prompt("Введите локацию: ");
    const location = getLocation(locationName);

    gameLogger.log(`${player.getName()} отправился в ${locationName}`);
    const enemy = location.spawnEnemy();
    gameLogger.log(`У ${player.getName()} на пути возникает ${enemy.getName()}, начинается бой!`);

    while (player.isAlive() && enemy.isAlive()) {
        prompt("Введите что-нибудь чтобы атаковать!");
        player.attack(enemy);
        
        const stunned = Math.random() < 0.5;
        if (stunned) {
            gameLogger.log(`${enemy.getName()} был оглушен атакой ${player.getName()}!`);
            continue;
        }
        enemy.attack(player);
    }

    console.log();

    if (!player.isAlive()) {
        gameLogger.log(`${player.getName()} был убит...`);
        return;
    }

    gameLogger.log(`Злой ${enemy.getName()} был побежден! ${player.getName()} отправился дальше по тропе судьбы...`);
}

function getChest(characterClass: CharacterClass): EquipmentChest {
    switch (characterClass) {
        case CharacterClass.MAGE:
            return new MagicalEquipmentChest();
        case CharacterClass.WARRIOR:
            return new WarriorEquipmentChest();
        case CharacterClass.THIEF:
            return new ThiefEquipmentChest();
        case CharacterClass.ROGUE:
            return new RogueEquipmentChest();
        default:
            throw new Error("Неизвестный класс персонажа");
    }
}

function getLocation(locationName: string): Location {
    switch (locationName.toLowerCase()) {
        case "мистический лес":
            return new Forest();
        case "логово дракона":
            return new DragonBarrow();
        case "проклятый дом":
            return new HauntedHouse();
        default:
            throw new Error("Неизвестная локация");
    }
}

main();
