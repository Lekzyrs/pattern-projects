protocol Alive {
    func getName() -> String
    func getAge() -> Int
    func makeSound() -> String
}

class Animal: Alive {
    private let name: String
    private let age: Int
    
    init(name: String, age: Int) {
        self.name = name
        self.age = age
    }
    
    func getName() -> String {
        return name
    }
    
    func getAge() -> Int {
        return age
    }
    
    func makeSound() -> String {
        return ""
    }
}

class Cat: Animal {
    override func makeSound() -> String {
        return Bool.random() ? "meow" : "..."
    }
}

class Dog: Animal {
    override func makeSound() -> String {
        return Bool.random() ? "bark" : "..."
    }
}

class Person {
    private let name: String
    private let age: Int
    private var companion: Alive
    
    init(name: String, age: Int, companion: Alive) {
        self.name = name
        self.age = age
        self.companion = companion
    }
    
    func getCompanionInfo() {
        let companion = companion
        let sound = companion.makeSound()
        let soundOutput = sound.isEmpty ? "is silent" : "says '\(sound)'"
        
        print("\(name)'s companion is \(companion.getName()), age \(companion.getAge()), who \(soundOutput).")
    }
}


let catCompanion = Cat(name: "Megatron", age: 3)
let dogCompanion = Dog(name: "Bartholomew", age: 5)


let person1 = Person(name: "Alice", age: 30, companion: catCompanion)
let person2 = Person(name: "Joe", age: 25, companion: dogCompanion)


person1.getCompanionInfo()
person2.getCompanionInfo()
