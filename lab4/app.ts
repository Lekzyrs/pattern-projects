import promptSync from 'prompt-sync';
import { jsonProperty, Serializable } from "ts-serializable";
import fs from "fs";
import path from 'path';
import readline from 'node:readline';

class GameLogger {

    private static instance: GameLogger | null = null;


    private constructor() { }

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

    protected name: string;
    protected health: number;
    protected damage: number;


    constructor(name: string, health: number, damage: number) {
        this.name = name;
        this.health = health;
        this.damage = damage;
    }

    public getName(): string {
        return this.name;
    }

    public getHealth(): number {
        return this.health;
    }
    getDamage(): number {
        return this.damage;
    }

    public abstract takeDamage(damage: number): void;
    public abstract attack(player: PlayableCharacter): void;

    public isAlive(): boolean {
        return this.health > 0;
    }
}

export class BaseEnemyDecorator extends Enemy {

    protected wrapee: Enemy;
    protected logger: GameLogger;

    constructor(wrapee: Enemy) {
        super(wrapee.getName(), wrapee.getHealth(), wrapee.getDamage());
        this.wrapee = wrapee;
        this.logger = GameLogger.getInstance();
    }

    public getName(): string {
        return this.wrapee.getName();
    }

    public getHealth(): number {
        return this.wrapee.getHealth();
    }

    public isAlive(): boolean {
        return this.wrapee.isAlive();
    }

    public takeDamage(damage: number): void {
        this.wrapee.takeDamage(damage);
    }

    public attack(player: PlayableCharacter): void {
        this.wrapee.attack(player);
    }
}

export class LegendaryEnemyDecorator extends BaseEnemyDecorator {
    private static readonly ADDITIONAL_DAMAGE = 20;

    constructor(wrapee: Enemy) {
        super(wrapee);
    }

    getName(): string {
        return `Легендарный ${super.getName()}`;
    }

    attack(player: PlayableCharacter): void {
        super.attack(player);

        this.logger.log("Враг легендарный и наносит дополнительный урон!!!");
        player.takeDamage(LegendaryEnemyDecorator.ADDITIONAL_DAMAGE);
    }
}

export class WindfuryEnemyDecorator extends BaseEnemyDecorator {
    constructor(wrapee: Enemy) {
        super(wrapee);
    }

    getName(): string {
        return `Обладающий Неистовством Ветра ${super.getName()}`;
    }

    attack(player: PlayableCharacter): void {
        super.attack(player);

        this.logger.log("Неистовство ветра позволяет врагу атаковать второй раз!!!");
        super.attack(player);
    }
}

interface PlayableCharacter {
    getName(): string;
    takeDamage(damage: number): void;
    isAlive(): boolean;
}

export interface Weapon {

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


export class WeaponToEnemyAdapter extends Enemy {
    private static readonly DISPEL_PROBABILITY = 0.2;

    private logger: GameLogger;
    private weapon: Weapon;

    constructor(weapon: Weapon) {
        super("Магическое оружие", 50, weapon.getDamage()); // Устанавливаем имя, здоровье и урон из оружия
        this.logger = GameLogger.getInstance();
        this.weapon = weapon;
    }

    takeDamage(damage: number): void {
        this.logger.log(`${this.name} получает ${damage} урона!`);
        this.health -= damage;

        const dispelRoll = Math.random(); // Генерация случайного числа от 0 до 1
        if (dispelRoll <= WeaponToEnemyAdapter.DISPEL_PROBABILITY) {
            this.logger.log("Атака рассеяла заклятие с оружия!");
            this.health = 0;
        }

        if (this.health > 0) {
            this.logger.log(`У ${this.name} осталось ${this.health} здоровья`);
        }
    }

    attack(player: PlayableCharacter): void {
        this.logger.log(`${this.name} атакует ${player.getName()}!`);
        player.takeDamage(this.damage);
    }
}

export class WeaponEquipmentFacade {
    private equipmentChest: EquipmentChest;

    constructor(characterClass: CharacterClass) {
        switch (characterClass) {
            case CharacterClass.MAGE:
                this.equipmentChest = new MagicalEquipmentChest();
                break;
            case CharacterClass.WARRIOR:
                this.equipmentChest = new WarriorEquipmentChest();
                break;
            case CharacterClass.THIEF:
                this.equipmentChest = new ThiefEquipmentChest();
                break;
            case CharacterClass.ROGUE:
                this.equipmentChest = new RogueEquipmentChest();
                break;

        }
    }

    getWeapon(): Weapon {
        return this.equipmentChest.getWeapon();
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


export class HauntedManor implements Location {

    private weaponEquipmentFacade: WeaponEquipmentFacade;

    constructor() {
        const randomIndex = Math.floor(Math.random() * Object.keys(CharacterClass).length / 2); // Получаем случайный индекс для CharacterClass
        const randomClass = Object(CharacterClass)[randomIndex];
        this.weaponEquipmentFacade = new WeaponEquipmentFacade(randomClass);
    }

    spawnEnemy(): Enemy {
        const weapon: Weapon = this.weaponEquipmentFacade.getWeapon();
        const enchantedWeapon: Enemy = new WeaponToEnemyAdapter(weapon);
        return enchantedWeapon;
    }
}

export class PlayerProfile {
    private name: string;
    private score: number;

    constructor(name: string, score: number) {
        this.name = name;
        this.score = score;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getScore(): number {
        return this.score;
    }

    public setScore(score: number): void {
        this.score = score;
    }
}

export interface PlayerProfileRepository {
    getProfile(name: string): PlayerProfile | null;
    updateHighScore(name: string, score: number): void;
}

export class PlayerProfileDBRepository implements PlayerProfileRepository {
    private static readonly SCORE_FILENAME: string = path.resolve('score.json');

    constructor() {
        if (!fs.existsSync(PlayerProfileDBRepository.SCORE_FILENAME)) {
            fs.writeFileSync(PlayerProfileDBRepository.SCORE_FILENAME, JSON.stringify({}));
        }
    }

    public getProfile(name: string): PlayerProfile | null {
        const playerProfiles = this.findAll();
        const profileData = playerProfiles[name];

        if (!profileData) {
            const newProfile = new PlayerProfile(name, 0);
            playerProfiles[name] = this.toPlainObject(newProfile);
            this.update(playerProfiles);
            return newProfile;
        }

        return this.fromPlainObject(profileData);
    }

    public updateHighScore(name: string, score: number): void {
        const playerProfiles = this.findAll();

        if (!playerProfiles[name]) {
            playerProfiles[name] = this.toPlainObject(new PlayerProfile(name, score));
        } else {
            playerProfiles[name].score = score;
        }

        this.update(playerProfiles);
    }

    private findAll(): Record<string, { name: string; score: number }> {
        const data = fs.readFileSync(PlayerProfileDBRepository.SCORE_FILENAME, 'utf-8');
        return JSON.parse(data);
    }

    private update(playerProfiles: Record<string, { name: string; score: number }>): void {
        fs.writeFileSync(PlayerProfileDBRepository.SCORE_FILENAME, JSON.stringify(playerProfiles, null, 4), 'utf-8');
    }

    private toPlainObject(profile: PlayerProfile): { name: string; score: number } {
        return { name: profile.getName(), score: profile.getScore() };
    }

    private fromPlainObject(data: { name: string; score: number }): PlayerProfile {
        return new PlayerProfile(data.name, data.score);
    }
}


export class PlayerProfileCacheRepository implements PlayerProfileRepository {
    private cache: Map<string, PlayerProfile> = new Map();
    private database: PlayerProfileDBRepository;

    constructor() {
        this.database = new PlayerProfileDBRepository();
    }

    public getProfile(name: string): PlayerProfile | null {
        if (!this.cache.has(name)) {
            const profile = this.database.getProfile(name);
            if (profile) this.cache.set(name, profile);
        }
        return this.cache.get(name) || null;
    }

    public updateHighScore(name: string, score: number): void {
        const profile = this.getProfile(name);
        if (profile) {
            profile.setScore(score);
            this.cache.set(name, profile);
            this.database.updateHighScore(name, score);
        }
    }
}


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const askQuestion = (question: string): Promise<string> => {
    return new Promise((resolve) => rl.question(question, resolve));
};

const main = async () => {
    const gameLogger = GameLogger.getInstance();
    const repository = new PlayerProfileCacheRepository();

    console.log("Создайте своего персонажа:");

    const name = await askQuestion("Введите имя: ");
    let playerProfile = repository.getProfile(name);

    console.log(`Ваш текущий счет: ${playerProfile?.getScore() || 0}`);
    const classOptions = Object.keys(CharacterClass).join(', ');
    console.log(`Выберите класс из списка: ${classOptions}`);
    const characterClassInput = await askQuestion("Введите класс: ");
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
    const locationName = await askQuestion("Введите локацию: ");
    const location = getLocation(locationName);

    gameLogger.log(`${player.getName()} отправился в ${locationName}`);
    let enemy = location.spawnEnemy();
    gameLogger.log(`У ${player.getName()} на пути возникает ${enemy.getName()}, начинается бой!`);

    while (player.isAlive() && enemy.isAlive()) {
        await askQuestion("Введите что-нибудь чтобы атаковать!");
        player.attack(enemy);

        if (Math.random() < 0.5) {
            gameLogger.log(`${enemy.getName()} был оглушен атакой ${player.getName()}!`);
            continue;
        }

        enemy.attack(player);
    }

    if (!player.isAlive()) {
        gameLogger.log(`${player.getName()} был убит...`);
        rl.close();
        return;
    }

    gameLogger.log(`Злой ${enemy.getName()} был побежден! ${player.getName()} отправился дальше по тропе судьбы...`);

    // Обновление счета игрока
    repository.updateHighScore(name, (playerProfile?.getScore() || 0) + 100);
    playerProfile = repository.getProfile(name);
    console.log(`Ваш обновленный счет: ${playerProfile?.getScore()}`);

    rl.close();
};

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
            return new HauntedManor();
        default:
            throw new Error("Неизвестная локация");
    }
}

// Запуск игры
main().catch((err) => console.error(err));