---
title: Why use an ECS?
description: An explanation of the benefits of using an ECS architecture.
---

## Why would we use an ECS over a more traditional object-oriented approach like Mojang did?

There's a few reasons why an ECS is a better fit for games than a more traditional object-oriented approach. The main reason is that it allows for better performance and scalability.

#### Cache locality

One massive benefit of an ECS is that it allows for better cache locality. In a traditional object-oriented approach, you might have a `Player` class that has a `Position` and `Velocity` as member variables. When you want to update the position of all players, you would have to iterate over all `Player` objects and access their `Position` and `Velocity`. However a player would likely also have a `Health` component, an `Inventory` component, and a `Name` component. This means that when you iterate over all players, you're also accessing a lot of data that you don't need for the position update. This can lead to cache misses and poor performance.

An ECS, on the other hand, stores components of the same type together in memory. It does a lot more complicated stuff but you can think of it as storing entities as

```rust
struct Entities {
    position: Vec<Position>,
    velocity: Vec<Velocity>,
    health: Vec<Health>,
    inventory: Vec<Inventory>,
    name: Vec<Name>,
}
```

rather than

```rust
struct Player {
    position: Position,
    velocity: Velocity,
    health: Health,
    inventory: Inventory,
    name: Name,
}
struct Entities {
    players: Vec<Player>,
}
```

This leads to you only accessing the data you need for the position update, which leads to better cache locality and better performance.

As for why Mojang didn't use this, they actually did in Bedrock edition, but not in Java edition. The reason for this is probably only known to Mojang, but I assume it was because the ECS approach wasn't as well known back then, and the choice of Java as a language would have caused the garbage collector and bytecode interpreter to get in the way of all the cache locality that an ECS provides. An ECS relies on being able to store components of the same type together in memory, and Java doesn't give you that level of control over memory layout.

#### Fits better with Rust's strengths

While Rust can be used in an OOP style, it's not as suited for it as something like Java or C++. Instead, Rust is better suited for a data-oriented approach like an ECS. This is because Rust gives you more control over memory layout and ownership, which allows you to take advantage of cache locality and avoid unnecessary allocations. Bevy in particular leverages Rust's powerful type system to provide a very flexible and performant ECS implementation.

#### Scalability

While this can often come down to implementation details, an ECS can often be more scalable than a traditional object-oriented approach. This is because an ECS allows you to easily add new components and systems without having to modify existing code. In a traditional object-oriented approach, adding a new feature often requires modifying existing classes, which can lead to a lot of code churn and potential bugs. An ECS allows you to add new features by simply adding new components and systems, which can be done in isolation from existing code.

#### Multithreading

Bevy has a really neat feature where it can automatically parallelize systems that don't have any dependencies on each other. This is a huge win for performance, especially on modern hardware with many cores. In a traditional object-oriented approach, you would have to manually manage threads and synchronization, which can be error-prone and difficult to get right. An ECS allows you to easily take advantage of multithreading without having to worry about the low-level details. Basically if you have 2 systems and neither of them write to a component that the other reads or writes to, Bevy will run them in parallel. If required ordering can be manually specified, but Bevy will automatically figure out the ordering of systems based on their component access patterns. This encourages writing small, focused systems that can be easily parallelized, which leads to better performance and scalability.

#### Ease of testing

Since systems are just functions that operate on components, they can be easily tested in isolation. Each unit test can spin up a small world with just the components it needs, run the system, and then check the results. This makes it easy to write unit tests for your logic, which can lead to better code quality and fewer bugs. Instead of having layers of inheritance and polymorphism to deal with like you would in an OOP approach, you can just write a system that operates on the components it needs and test it in isolation. This leads to better code quality and fewer bugs.
