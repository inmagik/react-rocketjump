---
id: side_effects
title: Side Effects
sidebar_label: Side Effects
slug: /side-effects
---

## Architecture overview

When a RjObject is consumed an **action observable** `Observable<EffectAction>` is created this rapresent the stream of effect actions dispatched from action creators.

The original action observable are passed into `effectPipeline` which return the same contract of effect actions stream.

From action observable a **dispatch observable** is created according to `takeEffect` and `addSideEffect` options.

The actions emitted from dispatch observable are dispatched on reducer.

![img](../static/img/RjSideEffectModel.png)

## Take effect

Take effect abstraction describe how your **RUN** is handled by RocketJump.