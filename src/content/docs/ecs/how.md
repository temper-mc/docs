---
title: How do I use the ECS?
description: Working with the ECS in Temper
---

Using the ECS in Temper mostly depends on what you want to do. You likely want to add a new system to implement some new behavior, or add a new component to store some new data. This guide will go over the basics of how to do that.

### Making a system

Making a system is pretty simple; you just make a function and add it to the schedule. If you look in the `src/game-systems/src` folder you'll see some sub-crates that contain catagories of systems. Pick the one that makes the most sense for your system (or add a new one if it doesn't make sense to put it in any of the existing ones) and create a new .rs file for your system. Then just make a public function and add it to the schedule in `src/game-systems/src/lib.rs`. You should end up with something like this:

> src/game-systems/background/src/new-system.rs

```rust
pub fn my_new_system() {
    println!("My function is doing something!");
}
```

<br/>

> src/game-systems/lib.rs

```rust
// This function already exists, just add your system in the body
fn register_tick_systems(schedule: &mut Schedule) {
    // Note the lack of backets at the end of your function's path
    // You are giving the function to bevy, not calling it
    schedule.add_systems(background::new_system::my_new_system);
}
```

Your function will now run on every game tick and announce that it's doing something.

### Querying entities

Next, lets make your system do something a little more useful. Temper already has a much more complicated velocity system but this simplified one should give you and idea of how it all works.

First we need to query all entities with a `Velocity` and `Position` components:

```rust
pub fn my_new_system(mut query: Query<(&Velocity, &Position)>) {
    for (vel: &Velocity, pos: &Position) in query.iter() {
        println!("Velocity vector: {}, Position vector: {}", vel, pos);
    }
}
```

Now your system will print out the velocity and position of every entity that has both components. No inheritance, no `Vec<Box<dyn HasVelocity>>`, it just works.

To get your system to actually update components we need to let Bevy know we want to make a component mutable. We can do this by updating the query to use `&mut Position` instead and swap to `query.iter_mut()`. This will wrap `Position` in Bevy's `Mut<>` generic that allows for mutability. Then we can simply add the velocity:

```rust
pub fn my_new_system(mut query: Query<(&Velocity, &mut Position)>) {
    for (vel: &Velocity, mut pos: Mut<Position>) in query.iter_mut() {
        pos += vel.to_dvec3();
    }
}
```

Under the hood both `Velocity` and `Position` are thin wrappers over bevy_math's `DVec3` type, allowing us to just add them together. And it's that simple!

Of course this isn't taking into account stuff like collisions, so lets take a quick look at how you might do that.

### Accessing the world through resources

In Temper we store the world in the global state, which can be accessed via the `GlobalStateResource` (or just `GlobalState` if you can't access the ECS). So a velocity system that checks for collisions would look something like this:

```rust
pub fn my_new_system(mut query: Query<(&Velocity, &mut Position)>, state: Res<GlobalStateResource>) {
    for (vel: &Velocity, mut pos: Mut<Position>) in query.iter_mut() {
        let projected_position: Position = pos + vel;

        // Actually a BlockStateID but not really relevant
        let block_at_projected: Block = state.
            0.
            world.
            // Either fetch the chunk from storage or generate it
            get_or_generate().
            expect("Could not fetch or generate chunk").
            get_block(ChunkBlockPos::from(projected_position));

        // This method doesn't actually exist but you get the idea
        if (block_at_projected.is_solid()) {
            handle_collision();
        } else {
            pos += vel;
        }
    }
}
```

Of course our actual velocity system takes into account stuff like hitboxes (which are also components) and does some maths to figure out where to stop players but this should give you an idea of how an ECS can be used. In a more OOP approach it might look something like this:

```rust
pub trait HasVelocity {
    fn tick_velocity(&mut self);
}

fn global_tick() {
    loop {
        ...
        let mut velocity_entities: Vec<Box<dyn HasVelocity>> = ...;

        for velocity_entity in velocity_entities {
            velocity_entity.tick_velocity();
        }
    }
}
```

This looks simpler on the surface, but quickly gets hard to manage when you have a thousand traits all doing this.

### More advanced queries

Bevy has extra query features for stuff like filtering, optional components, and more. For example, you can filter entities that have a specific component or exclude entities with a certain component:

```rust
pub fn my_filtered_system(query: Query<(&Velocity, &mut Position), Without<Grounded>>) {
    for (vel: &Velocity, mut pos: Mut<Position>) in query.iter_mut() {
        pos += vel.to_dvec3();
    }
}
```

or check for optional components using `Has<T>`:

```rust
pub fn my_optional_component_system(query: Query<(&Velocity, &mut Position, Has<&Grounded>)>) {
    for (vel: &Velocity, mut pos: Mut<Position>, grounded: bool) in query.iter_mut() {
        if grounded {
            // Handle grounded logic
        }
        pos += vel.to_dvec3();
    }
}
```

or even optionally include components using `Option<T>`:

```rust
pub fn my_option_component_system(query: Query<(&Velocity, &mut Position, Option<&Grounded>)>) {
    for (vel: &Velocity, mut pos: Mut<Position>, grounded: Option<&Grounded>) in query.iter_mut() {
        if let Some(grounded) = grounded {
            // Handle grounded logic
        }
        pos += vel.to_dvec3();
    }
}
```

We often use these for mob-related stuff, where every mob and player has a marker component (eg, players have a `PlayerMarker`, pigs have a `PigMarker` and so on) to run specific systems on specific mobs. For example the pig AI system might look like this:

```rust
pub fn pig_ai_system(query: Query<(...), With<PigMarker>>) {
    for components: (...) in query.iter_mut() {
        // Pig AI logic here
    }
}
```
