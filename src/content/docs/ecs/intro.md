---
title: Intro to an Entity Component System
description: A quick introduction to Bevy and what an ECS is in general
---

# So what is an ECS?

An Entity Component System (ECS) is a way of organizing data and behavior in a game engine. It is made of three parts: entities, components, and systems, but Bevy adds some extras like messages and resources.

### Bevy?

Bevy is a game engine written in Rust that uses an ECS architecture. We use the ECS crate (as well as their maths crate for some vector math) in Temper, but we don't use Bevy itself. The ECS crate is a standalone library that can be used in any Rust project, and it is the same library that Bevy uses under the hood.

Bevy relies on some truly insane type system abuse so it can be hard to wrap your head around at first and can produce some pretty gnarly compiler errors, but it is also extremely powerful and flexible.

## Entities

Entities are just instances of things. This could be a player, a mob, an arrow, etc. They are just a unique ID, and they don't have any data or behavior on their own.

Minecraft maps quite nicely to this idea since pretty much everything dynamic in the world is an entity (except blocks) but in other games this could be a bit more abstract. For example, in a 2D platformer, the player character is an entity, but so is the camera, and so is the background music.

In Bevy these are represented by the `Entity` type, which is just a wrapper around a unique 64bit ID. These IDs have no meaning outside of Bevy, and they are not guaranteed to be the same between runs.

## Components

Components are just data. They are the properties of an entity. For example, a player entity might have a `Health` component, a `Position` component, and a `Velocity` component. An arrow entity might have a `Position` component, a `Velocity` component, and a `Damage` component, but probably not a `Health` component.

In Bevy these are structs or enums that implement the `Component` trait:

```rust
#[derive(Component)]
struct Position {
    x: f32,
    y: f32,
}
```

## Systems

Systems are the behavior of an entity. They are functions that operate on entities with certain components. For example, a system might be responsible for moving all entities with a `Position` and `Velocity` component, or for applying damage to all entities with a `Health` component.

In Bevy these are functions that take in queries of components and operate on them. For example, a system that moves all entities with a `Position` and `Velocity` component might look like this:

```rust
fn move_system(mut query: Query<(&mut Position, &Velocity)>) {
    for (mut position, velocity) in query.iter_mut() {
        position.x += velocity.x;
        position.y += velocity.y;
    }
}
```

## Messages

While not strictly part of the ECS design pattern, Bevy also has a messaging system that allows systems to communicate with each other. This is done through events, which are just structs that can be sent and received by systems. While a lot more complicated under the hood, you can pretty much just treat these like channels that get cleared after every tick. For example, a system that prints a join message when a player joins the game might look like this:

```rust
fn player_join_system(mut events: EventWriter<PlayerJoinEvent>) {
    // Assume there is some way to detect when a player joins the game, and that we have access to their name.
    let player_name = "Player1"; // This would be dynamically determined in a real system
    events.write(PlayerJoinEvent { player_name: player_name.to_string() });
}

fn player_join_message(mut events: EventReader<PlayerJoinEvent>) {
    for event in events.iter() {
        println!("Player {} has joined the game!", event.player_name);
    }
}
```

## Resources

Also not strictly part of the ECS design pattern, Bevy has a concept of resources. Resources are just global data that can be accessed by systems. For example, a resource might be a configuration struct that holds game settings, or a resource might be a database connection pool. In Temper we heavily use it to store the global state of the world, such as the physical world, server config and the thread pool. Resources are just structs that implement the `Resource` trait, and they can be accessed by systems the same way as queries and messages:

```rust
fn my_system(state: Res<GlobalStateResource>) {
    println!("Max players: {}", state.max_players);
}
```

<sub>Note that in the Temper codebase we define the `GlobalStateResource` as `struct GlobalStateResource(pub GlobalState)` and `GlobalState` as `Arc<State>` where `State` is the actual global state struct. This is so the state can be accessed both from within the ECS and outside it.</sub>
