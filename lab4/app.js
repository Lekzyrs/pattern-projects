"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerProfileCacheRepository = exports.PlayerProfileDBRepository = exports.PlayerProfile = exports.HauntedManor = exports.DragonBarrow = exports.Forest = exports.Dragon = exports.Goblin = exports.WeaponEquipmentFacade = exports.WeaponToEnemyAdapter = exports.WindfuryEnemyDecorator = exports.LegendaryEnemyDecorator = exports.BaseEnemyDecorator = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_readline_1 = __importDefault(require("node:readline"));
class GameLogger {
    constructor() { }
    static getInstance() {
        if (GameLogger.instance === null) {
            GameLogger.instance = new GameLogger();
        }
        return GameLogger.instance;
    }
    log(message) {
        console.log(`[GAME LOG]: ${message}`);
    }
}
GameLogger.instance = null;
const logger = GameLogger.getInstance();
logger.log("Игра началась!");
const logger2 = GameLogger.getInstance();
console.log(logger === logger2);
class Enemy {
    constructor(name, health, damage) {
        this.name = name;
        this.health = health;
        this.damage = damage;
    }
    getName() {
        return this.name;
    }
    getHealth() {
        return this.health;
    }
    getDamage() {
        return this.damage;
    }
    isAlive() {
        return this.health > 0;
    }
}
class BaseEnemyDecorator extends Enemy {
    constructor(wrapee) {
        super(wrapee.getName(), wrapee.getHealth(), wrapee.getDamage());
        this.wrapee = wrapee;
        this.logger = GameLogger.getInstance();
    }
    getName() {
        return this.wrapee.getName();
    }
    getHealth() {
        return this.wrapee.getHealth();
    }
    isAlive() {
        return this.wrapee.isAlive();
    }
    takeDamage(damage) {
        this.wrapee.takeDamage(damage);
    }
    attack(player) {
        this.wrapee.attack(player);
    }
}
exports.BaseEnemyDecorator = BaseEnemyDecorator;
class LegendaryEnemyDecorator extends BaseEnemyDecorator {
    constructor(wrapee) {
        super(wrapee);
    }
    getName() {
        return `Легендарный ${super.getName()}`;
    }
    attack(player) {
        super.attack(player);
        this.logger.log("Враг легендарный и наносит дополнительный урон!!!");
        player.takeDamage(LegendaryEnemyDecorator.ADDITIONAL_DAMAGE);
    }
}
exports.LegendaryEnemyDecorator = LegendaryEnemyDecorator;
LegendaryEnemyDecorator.ADDITIONAL_DAMAGE = 20;
class WindfuryEnemyDecorator extends BaseEnemyDecorator {
    constructor(wrapee) {
        super(wrapee);
    }
    getName() {
        return `Обладающий Неистовством Ветра ${super.getName()}`;
    }
    attack(player) {
        super.attack(player);
        this.logger.log("Неистовство ветра позволяет врагу атаковать второй раз!!!");
        super.attack(player);
    }
}
exports.WindfuryEnemyDecorator = WindfuryEnemyDecorator;
var CharacterClass;
(function (CharacterClass) {
    CharacterClass["WARRIOR"] = "WARRIOR";
    CharacterClass["THIEF"] = "THIEF";
    CharacterClass["MAGE"] = "MAGE";
    CharacterClass["ROGUE"] = "ROGUE";
})(CharacterClass || (CharacterClass = {}));
class CharacterClassDetails {
    static getStartingHealth(characterClass) {
        return this.healthMap[characterClass];
    }
}
CharacterClassDetails.healthMap = {
    [CharacterClass.WARRIOR]: 100,
    [CharacterClass.THIEF]: 90,
    [CharacterClass.MAGE]: 80,
    [CharacterClass.ROGUE]: 10,
};
class PlayableCharacter {
    constructor(name, characterClass, weapon, armor) {
        this.logger = GameLogger.getInstance();
        this.name = name;
        this.characterClass = characterClass;
        this.weapon = weapon;
        this.armor = armor;
        this.health = CharacterClassDetails.getStartingHealth(this.characterClass);
    }
    takeDamage(damage) {
        const reducedDamage = Math.max(0, Math.round(damage * (1 - this.armor.getDefense())));
        this.health -= reducedDamage;
        this.armor.use();
        this.logger.log(`${this.name} получил урон: ${reducedDamage}`);
        if (this.health > 0) {
            this.logger.log(`${this.name} осталось ${this.health} здоровья`);
        }
    }
    attack(enemy) {
        this.logger.log(`${this.name} атакует врага ${enemy.getName()}`);
        this.weapon.use();
        enemy.takeDamage(this.weapon.getDamage());
    }
    isAlive() {
        return this.health > 0;
    }
    getName() {
        return this.name;
    }
}
class PlayableCharacterBuilder {
    setName(name) {
        this.name = name;
        return this;
    }
    setCharacterClass(characterClass) {
        this.characterClass = characterClass;
        return this;
    }
    setWeapon(weapon) {
        this.weapon = weapon;
        return this;
    }
    setArmor(armor) {
        this.armor = armor;
        return this;
    }
    build() {
        if (!this.name || !this.characterClass || !this.weapon || !this.armor) {
            throw new Error("Все поля должны быть заполнены перед созданием персонажа.");
        }
        return new PlayableCharacter(this.name, this.characterClass, this.weapon, this.armor);
    }
}
class Sword {
    constructor() {
        this.damage = 20;
        this.logger = GameLogger.getInstance();
    }
    getDamage() {
        return this.damage;
    }
    use() {
        this.logger.log("Удар мечом!");
    }
}
class Bow {
    constructor() {
        this.damage = 15;
        this.criticalChance = 0.3;
        this.criticalModifier = 2;
        this.logger = GameLogger.getInstance();
    }
    getDamage() {
        const roll = Math.random();
        if (roll <= this.criticalChance) {
            this.logger.log("Критический урон!");
            return this.damage * this.criticalModifier;
        }
        return this.damage;
    }
    use() {
        this.logger.log("Выстрел из лука!");
    }
}
class Staff {
    constructor() {
        this.damage = 25;
        this.scatter = 0.2;
        this.logger = GameLogger.getInstance();
    }
    getDamage() {
        const roll = Math.random();
        const factor = 1 + (roll * 2 * this.scatter - this.scatter);
        return Math.round(this.damage * factor);
    }
    use() {
        this.logger.log("Воздух накаляется, из посоха вылетает огненный шар!");
    }
}
class HeavyArmor {
    constructor() {
        this.defense = 0.3;
        this.logger = GameLogger.getInstance();
    }
    getDefense() {
        return this.defense;
    }
    use() {
        this.logger.log("Тяжелая броня блокирует значительную часть урона");
    }
}
class LightArmor {
    constructor() {
        this.defense = 0.2;
        this.logger = GameLogger.getInstance();
    }
    getDefense() {
        return this.defense;
    }
    use() {
        this.logger.log("Легкая броня блокирует урон");
    }
}
class Robe {
    constructor() {
        this.defense = 0.1;
        this.logger = GameLogger.getInstance();
    }
    getDefense() {
        return this.defense;
    }
    use() {
        this.logger.log("Роба блокирует немного урона");
    }
}
class WarriorEquipmentChest {
    getWeapon() {
        return new Sword();
    }
    getArmor() {
        return new HeavyArmor();
    }
}
class MagicalEquipmentChest {
    getWeapon() {
        return new Staff();
    }
    getArmor() {
        return new Robe();
    }
}
class ThiefEquipmentChest {
    getWeapon() {
        return new Bow();
    }
    getArmor() {
        return new LightArmor();
    }
}
class RogueEquipmentChest {
    getWeapon() {
        return new Bow();
    }
    getArmor() {
        return new LightArmor();
    }
}
class WeaponToEnemyAdapter extends Enemy {
    constructor(weapon) {
        super("Магическое оружие", 50, weapon.getDamage()); // Устанавливаем имя, здоровье и урон из оружия
        this.logger = GameLogger.getInstance();
        this.weapon = weapon;
    }
    takeDamage(damage) {
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
    attack(player) {
        this.logger.log(`${this.name} атакует ${player.getName()}!`);
        player.takeDamage(this.damage);
    }
}
exports.WeaponToEnemyAdapter = WeaponToEnemyAdapter;
WeaponToEnemyAdapter.DISPEL_PROBABILITY = 0.2;
class WeaponEquipmentFacade {
    constructor(characterClass) {
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
    getWeapon() {
        return this.equipmentChest.getWeapon();
    }
}
exports.WeaponEquipmentFacade = WeaponEquipmentFacade;
class Goblin extends Enemy {
    constructor() {
        super("Гоблин", 50, 10);
        this.logger = GameLogger.getInstance();
        this.name = "Гоблин";
        this.health = 50;
        this.damage = 10;
    }
    takeDamage(damage) {
        this.logger.log(`${this.name} получает ${damage} урона!`);
        this.health -= damage;
        if (this.health > 0) {
            this.logger.log(`У ${this.name} осталось ${this.health} здоровья`);
        }
    }
    attack(player) {
        this.logger.log(`${this.name} атакует ${player.getName()}!`);
        player.takeDamage(this.damage);
    }
}
exports.Goblin = Goblin;
class Dragon extends Enemy {
    constructor() {
        super("Дракон", 100, 30);
        this.gameLogger = GameLogger.getInstance();
        this.name = "Дракон";
        this.resistance = 0.2;
        this.health = 100;
        this.damage = 30;
    }
    takeDamage(damage) {
        damage = Math.round(damage * (1 - this.resistance));
        this.gameLogger.log(`${this.name} получает ${damage} урона!`);
        this.health -= damage;
        if (this.health > 0) {
            this.gameLogger.log(`У ${this.name} осталось ${this.health} здоровья`);
        }
    }
    attack(player) {
        this.gameLogger.log("Дракон дышит огнем!");
        player.takeDamage(this.damage);
    }
}
exports.Dragon = Dragon;
class Forest {
    spawnEnemy() {
        return new Goblin();
    }
}
exports.Forest = Forest;
class DragonBarrow {
    spawnEnemy() {
        return new Dragon();
    }
}
exports.DragonBarrow = DragonBarrow;
class HauntedManor {
    constructor() {
        const randomIndex = Math.floor(Math.random() * Object.keys(CharacterClass).length / 2); // Получаем случайный индекс для CharacterClass
        const randomClass = Object(CharacterClass)[randomIndex];
        this.weaponEquipmentFacade = new WeaponEquipmentFacade(randomClass);
    }
    spawnEnemy() {
        const weapon = this.weaponEquipmentFacade.getWeapon();
        const enchantedWeapon = new WeaponToEnemyAdapter(weapon);
        return enchantedWeapon;
    }
}
exports.HauntedManor = HauntedManor;
class PlayerProfile {
    constructor(name, score) {
        this.name = name;
        this.score = score;
    }
    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }
    getScore() {
        return this.score;
    }
    setScore(score) {
        this.score = score;
    }
}
exports.PlayerProfile = PlayerProfile;
class PlayerProfileDBRepository {
    constructor() {
        if (!fs_1.default.existsSync(PlayerProfileDBRepository.SCORE_FILENAME)) {
            fs_1.default.writeFileSync(PlayerProfileDBRepository.SCORE_FILENAME, JSON.stringify({}));
        }
    }
    getProfile(name) {
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
    updateHighScore(name, score) {
        const playerProfiles = this.findAll();
        if (!playerProfiles[name]) {
            playerProfiles[name] = this.toPlainObject(new PlayerProfile(name, score));
        }
        else {
            playerProfiles[name].score = score;
        }
        this.update(playerProfiles);
    }
    findAll() {
        const data = fs_1.default.readFileSync(PlayerProfileDBRepository.SCORE_FILENAME, 'utf-8');
        return JSON.parse(data);
    }
    update(playerProfiles) {
        fs_1.default.writeFileSync(PlayerProfileDBRepository.SCORE_FILENAME, JSON.stringify(playerProfiles, null, 4), 'utf-8');
    }
    toPlainObject(profile) {
        return { name: profile.getName(), score: profile.getScore() };
    }
    fromPlainObject(data) {
        return new PlayerProfile(data.name, data.score);
    }
}
exports.PlayerProfileDBRepository = PlayerProfileDBRepository;
PlayerProfileDBRepository.SCORE_FILENAME = path_1.default.resolve('score.json');
class PlayerProfileCacheRepository {
    constructor() {
        this.cache = new Map();
        this.database = new PlayerProfileDBRepository();
    }
    getProfile(name) {
        if (!this.cache.has(name)) {
            const profile = this.database.getProfile(name);
            if (profile)
                this.cache.set(name, profile);
        }
        return this.cache.get(name) || null;
    }
    updateHighScore(name, score) {
        const profile = this.getProfile(name);
        if (profile) {
            profile.setScore(score);
            this.cache.set(name, profile);
            this.database.updateHighScore(name, score);
        }
    }
}
exports.PlayerProfileCacheRepository = PlayerProfileCacheRepository;
// Игровая логика
const rl = node_readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const askQuestion = (question) => {
    return new Promise((resolve) => rl.question(question, resolve));
};
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const gameLogger = GameLogger.getInstance();
    const repository = new PlayerProfileCacheRepository();
    console.log("Создайте своего персонажа:");
    const name = yield askQuestion("Введите имя: ");
    let playerProfile = repository.getProfile(name);
    console.log(`Ваш текущий счет: ${(playerProfile === null || playerProfile === void 0 ? void 0 : playerProfile.getScore()) || 0}`);
    const classOptions = Object.keys(CharacterClass).join(', ');
    console.log(`Выберите класс из списка: ${classOptions}`);
    const characterClassInput = yield askQuestion("Введите класс: ");
    const characterClass = CharacterClass[characterClassInput];
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
    const locationName = yield askQuestion("Введите локацию: ");
    const location = getLocation(locationName);
    gameLogger.log(`${player.getName()} отправился в ${locationName}`);
    let enemy = location.spawnEnemy();
    gameLogger.log(`У ${player.getName()} на пути возникает ${enemy.getName()}, начинается бой!`);
    while (player.isAlive() && enemy.isAlive()) {
        yield askQuestion("Введите что-нибудь чтобы атаковать!");
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
    repository.updateHighScore(name, ((playerProfile === null || playerProfile === void 0 ? void 0 : playerProfile.getScore()) || 0) + 100);
    playerProfile = repository.getProfile(name);
    console.log(`Ваш обновленный счет: ${playerProfile === null || playerProfile === void 0 ? void 0 : playerProfile.getScore()}`);
    rl.close();
});
function getChest(characterClass) {
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
function getLocation(locationName) {
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
