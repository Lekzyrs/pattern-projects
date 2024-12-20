"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    isAlive() {
        return this.health > 0;
    }
}
var CharacterClass;
(function (CharacterClass) {
    CharacterClass["WARRIOR"] = "WARRIOR";
    CharacterClass["THIEF"] = "THIEF";
    CharacterClass["MAGE"] = "MAGE";
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

