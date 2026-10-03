---
title: Performance in the ECS
description: How to improve performance in the ECS
---

Unfortunately, performance in the ECS can be a complex topic, as it depends on how you structure your components and systems. Here are some tips to improve performance:

### Don't take more than you need

One common performance pitfall is querying for more components than your system actually needs. Only include the components that are necessary for your system's logic. This reduces the amount of data the ECS has to iterate over and can significantly improve performance. In bevy's case it can also massively improve multithreading efficiency, as the ECS can better parallelize systems when they have fewer component dependencies. This is something that can be done with both systems (by only querying for the components you need) and components (keeping them as small and focused as possible). For example, instead of having a single `Transform` component with position, rotation, and scale, you might split it into separate `Position`, `Rotation`, and `Scale` components if your systems only need one of these at a time. That way systems than need `Position` won't have to also fetch `Rotation` and `Scale`, improving cache efficiency and parallelism.

On a similar vein, if you only need to check if an entity has a specific component without actually using it, you can use `Has<T>` in your query. This allows you to filter entities based on the presence of a component without fetching the component data itself, which could lock bevy out of parallelizing your systems efficiently.

### Filtering in Queries instead of in the System

Another common performance improvement is to filter entities directly in the query rather than inside the system logic. For example, instead of querying all entities and then checking if they have a specific component inside the system, you can use `With<T>` or `Without<T>` in your query to only fetch the entities that match your criteria. This reduces the number of entities your system has to iterate over and can significantly improve performance.

### Try to keep systems small and focused

I get that its not always easy to do so, but where you can try to keep systems doing one specific task and using messages to manage follow on effects. Using collision and fall damage as an example, if you include fall damage within the collision system, the systems can't run in parallel and the overall performance may suffer. You'll also end up with one system pulling in many different components which can block other systems from running in parallel, reducing the overall efficiency of the ECS. If you instead split it up, the collision system and the fall damage system can run independently. It would also allow other systems needing collision information to run without being blocked by the fall damage logic.
