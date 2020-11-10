https://greensock.com/forums/topic/21598-overlapping-tweens-and-repeat-problem/

The aim of the project is to provide an API for tweening (i.e. interpolating) JavaScript objects. There are some popular existing solutions for this (search "tween" on npm).

At the time of me typing this sentence, the library has the following goals:  

* Provide a JavaScript tweening library that is both browser and Node compatible that is statically typed via TypeScript.
* Provide a syntax for creating composite tweens.
* Enable users to create new types of composite tweens that may behave slightly differently. Two examples will be provided by the library:
  * The Timeline. A Timeline's child tweens are each given start times. The Timeline, when updated, updates child animations according to their position on the timeline (i.e. `child.update(this.time - child.startTime)`).
  * The Sequence. A Sequence is a more specific version of the Timeline that is created by describing an ordering between child animations. That is, rather than each child having to be assigned their own start time, these start times are inferred by a provided ordering (plus optional offsets). The Sequence includes all of Timeline's functionality while also providing additional methods for moving about the sequence. See more later.
* Provide a syntax that, in combination with typechecking, helps the client programmer avoid creating conflicting tweens or composite animations (e.g. two tweens that attempt to tween the same target object concurrently).

## Tween

All tweens have the same fundamental properties:

* A starting point, or target. This is often the object we are trying to tween. As a result of this, a tween will write directly to this object, which is why we call it the `target`. If we did not like this mutability, we would have to generate copy objects for every update. This, in most usage scenarios I can imagine, would be a waste of computation time/memory and every tween would have to be accompanied by an update handler--most of which would just say "write these values to the target". We could accommodate for both scenarios with an optional boolean flag that specifies whether we write to the source or only generate new values--something like `writeToTarget` which defaults to true. However, I can't imagine scenarios in which we would set this, so I would leave it as a nice-to-have.
* A destination. This specifies the properties of the `target` that will be tweened, and what values they will have when the tween completes.
* An easing function. This describes, as a function of time, how the object tweens towards the destination. Maybe the animation starts slowly and gradually speeds up. Maybe the animation moves quickly and slows down towards the end. Maybe the target progresses towards the target but then bounces back before moving back toward the target again (like a bouncy ball falling from your hand to the hard floor). This is what the easing function specifies.
* A duration, or length. This is simply how long it takes for the tween to complete.

Our initial construction syntax can look like this:

```ts
const tween = new Tween(target, dest, easing, length);
```

A few concerns appear immediately to my mind. Let's go through them and address them as they come up.

### How do we get our tweens to run?

1. Should `tween` update itself, or should client's have to update it themselves? For example, @tweenjs/tween.js v18 (hereafter just "tween.js", not to be confused with @createjs/tweenjs) goes with the latter route of having the client call for updates, so we would have animation loop like this:

   ```ts
   // Inside our Renderer class. Let's assume we only want to target the browser, so we'll tie ourselves to using window.requestAnimationFrame for updating.
   
   class CardGameRenderer {
     private start() {
         this.stopped = false;
         window.requestAnimationFrame(() => this.update());
     }
     
     private update() { // Gets called every time browser is about to update.
     	if (this.stopped) return;
   
       updateUi();
       maybeDoSomethingElse();
       this.tweens.forEach(t => t.update()); // Here.
       window.requestAnimationFrame(() => this.update()); // Queue up next update.
     }
   }
   
   ```

   With this approach, there is no hidden magic. How tweens get updated is clearly expressed in the client's code. Let's examine some potential concerns with this:

   1. The client may accidentally forget to add one of their tweens to `this.tweens`, and an animation doesn't get updated. We could circumvent this with an approach similar to tweenjs where every tween is assigned a Group. By default, Tweens are assigned to the global group, `TWEEN`. Then we could replace `this.tweens.forEach(t => t.update())` with `TWEEN.update()` and do away with `this.tweens`. There is some hidden magic here, but it is arguably a nice compromise that still gives the client control over how tweens update while requiring very little code (and the little required code is pretty straightforward). Besides, the client code probably already has a rendering loop somewhere in their code, so this is just one line they need to add there. Alternatively, if we feel that the concept of Groups is a little much, we could just use a static collection that every Tween registers itself to and then the client code could do something like this: `Tween.updateAll()`. This adds a little more readability and doesn't complicate the Tween class with the concept of a Group. This forces all tweens to update together, but I cannot think of a scenario where we need separate renderers updating at different times, so I think this self-imposed restriction is fine.
   2. This could be considered unnecessary boilerplate. How often would a library user find themselves not wanting to simply update all tweens on every frame? Wouldn't it be convenient for the library to do this by default?[^ 2] This is the approach that involves hidden magic. What if the client isn't running on the browser (at the same time, how often do people animate something in JavaScript that is running in a terminal)? We could provide means to configure this behavior, but that's less intuitive for the client and complicates the library's implementation.
3. We could go with option 2, and add a global way of changing the update strategy. 
   4. If the idea of a single global factory isn't ideal, we could also force the user to create a factory before they can ever create a tween. We could also combine a forced-factory approach with either 2 or 3.
   
   All this being said, I current approach of updating all tweens automatically on every browser frame, like how GSAP v3.5 does it. If the client doesn't want the tween to update along with the rest, they can just stop the tween and discard it.

### Should tweens start immediately after creation?

Continuing with the idea of user control, clarity versus convenience, and conciseness, we once again learn towards convenience. Once the tween is constructed, it starts running (without, say, a call to a `start` method). I have not personally ran into a situation using other libraries where I have created a tween but did not want it to start immediately. There have been instances  I will admit that having a constructor resulting in side-effects is awkward, since constructors generally just do exactly that, construct something. Usually the behavior only starts after calling some method or providing the object another function.[^3]

Another potential point of confusion with not starting tweens immediately is the question of whether the tween starts from if `target` was mutated in between the creation of the tween and when it begins to run. Do we snapshot the value of `target` at the time of tween's creation? When we start running the tween, there would be a (probably backwards) jump. We could snapshot it at start. That would be OK I suppose. This would allow to create tweens ahead of time like this:

```ts
const light = { brightness: 0.0 };

const turnLightOff = new Tween(light, {brightness: 0}, Easing.Lienar, 500); // If we snapshot now, just instantly turns light off.
light.brightness = 1.0;
turnLightOff.start(); // If we snapshot now instead, works!
```

However, this type of scenario strikes me as unlikely. Also, what would happen if we called `turnLightOff` again in the future? Is it a no-op (tween already started)? Do we start over, taking a new snapshot of `light`? This might be useful, but this requires the reader to look at documentation to realize this behavior exists. Besides, the client could just do something like this instead:

```ts
// Let's go back to tweens starting immediately.
const turnLightOff = () => new Tween(light, {brightness: 0}, Easing.Linear, 500);
// Now we just do this.
turnLightOff();
```

### Verbosity/redundant providing of parameters

Many users won't require more than one easing function. Some might not need even need more than one `length` value (e.g. all board games pieces take 500ms to move). Users could solve this inconvenience by writing their own factory function.

```ts
const makeCardTween = (target, dest) => new Tween(target, dest, Easing.Linear, 500);
```

This is acceptable, but we could also provide that built-in factory function to make this easier. 

### How do make room for future parameters/configuration options?

What if we want to introduce more configuration parameters? We could introduce another, optional, parameter that is an object that contains all the options. This is a very common practice in JS that makes configurable options readable and prevents massive parameter lists where clients have to provide a bunch of values for parameters they (usually) never want to change. At this point, we are at five parameters which is a bit unpleasant but isn't too bad; I think each of the parameters deserves its spot in our lengthy constructor. Alternatively, We could make the tween only take a single object parameter, but this would also make construction more tedious for the client:

```ts
const tween = new Tween({
    target: playerCard,
    destination: someLocationOnTheGameTable,
    easing: Easing.Linear,
    duration: 1000,
    someOptionalOption: true,
});	
```

Having to type `target`, `destination`, `easing`, `duration` could get annoying quickly, though this does make the construction syntax more readable. However, our initial syntax is just as readable, but only because we have named variables passed it. However, most usage scenarios will involve tweening some sort of named object to some sort of calculated destination, and clients can always name their variables to prevent any confusion.

```ts
// After the player plays a card onto the table, there will either be an empty gap in the player's 
// hand, or (if the leftmost or rightmost card is selected) the hand will be off-center. Call this
// to gracefully reorganize the player's hand. We also return the created tweens so other code 
// interact with these animations (e.g. skip them, abort them, undo them, etc.).
function updatePlayerHand(): Tween<Card> {
    const cards = this.playerHand; // Save ourselves some keystrokes.
    const numCards = cards.length;
    {cardAnimEasing, cardDuration} = this.config;
    // Let's say x = 0 represents the center of the screen.
    const firstCardXPos = -((numCards / 2) + (numCards * spaceBetweenCards));
    const tweens = this.cards.map((card, index) => {
       const xPosOfThisCard = firstCardXPos + (cardWidth + spaceBetweenCards) * index;
       return new Tween(card, {x: xPosOfThisCard}, cardAnimEasing, cardAnimDuration);
    });
    return tweens;
}
```

### Readability and the (step-)builder pattern approach to construction

Looking at our initial proposed construction syntax, the reader has to look at the parameters to make an informed guess as to what they are or navigate to the constructor to see what they are. However, as much as I generally prefer sacrificing conciseness for clarity at the cost of verbosity, I don't think its worth it here. The parameters are distinct from each other in type, making it hard to confuse parameter ordering (as typechecking will prevent it), and it's easy to infer what the parameters are. Besides, I imagine most client code will be similar to the previous code snippet in the sense that it will be using named variables. `new Tween(card, {x: xPosOfThisCard}, cardAnimEasing, cardAnimDuration)` is fairly intuitive to me. Even if the arguments aren't coming from named variables, I think a reader familiar with the concept of a Tween could accurately guess what each parameter represents. 

#### Naïve approach

Another potential approach to Tween construction is some sort of builder pattern-style syntax. Being inspired by libraries such as @Createjs/tweenjs and tween.js, here is the one I initially think of:

```ts
const tween = Tween.get(target).to(dest).easing(easingFn).duration(500);
```

However, how to include our fifth optional options parameter isn't obvious. Remember that we currently plan to have tweens immediately start. This means that, in the process of keeping this consistent with the constructor syntax, this tween would be instantiated and active after the call to `duration`. The more obvious potential solutions are:

1. Allow the options to be changed post-creation. This, while most convenient for construction, is prone to problems. What if the tween needs to know the value of an option at construction time to determine some part of its behavior? What if the user attempts to change an option on the fly and old and new values are irreconcilable? Then we either have weird/undefined behavior or a runtime error.

2. Have the `options` parameter be included as a second parameter to either `get` or `to`. @Createjs/tweenjs v1 places this in its `get` method. This feels a bit awkward to have two unrelated concepts together in the `get` step, but it gets the job done and clients can quickly figure out what is going on by reading the documentation with minimal headache. GSAP v3 takes this further by having merging the easing, duration, and destination values into a single object (GSAP also provides defaults for easing and duration, making them optional parameters that can be configured via a singleton).

3. Introduce an optional step, `opts` along the way. We can provide another `options` step anywhere in our step-builder, as long as it comes before the final step. For example:

   ```ts
   const options: TweenOpts = { /* ... */ };
   
   const tween = Tween.get(target).to(dest).opts(options).easing(easingFn).duration(500); // or
   const tween = Tween.get(target).opts(options).to(dest).easing(easingFn).duration(500); // or
   const tween = Tween.get(target).to(dest).easing(easingFn).opts(options).duration(500);
   const tween = Tween.get(target).opt(options).to(dest).easing(easingFn).opts(otherOpts).duration(500); // Hmm, specified two different options objects. We could throw or we could merge the two option objects together, giving preference to the latter.
   ```

   However, it seems awkward to optional config come before mandatory properties like duration and the easing.

4. Add the `opts` as on optional step after `duration`. This is currently not possible (see point 1), but what we can do is not have `duration` be the final step. We can introduce an additional step `go` (or `build` if sticking with traditional builder-pattern style) that is empty and is the last step that finalizes the tween.

   ```ts
   const tween = Tween.get(target).to(dest).easing(easingFn).duration(500).start(); // or
   const tweenWithOpts = Tween.get(target).to(dest).easing(easingFn).duration(500).opts(options).start();
   ```

   This is a little less intuitive because, unlike the constructor, tweens don't start immediately once all required information is provided. This is an inconsistency, though its not too bad. The client would see this quickly in the docs that describe the builder syntax. We could also hide the Tween constructor and make the builder-style the only way to go, eliminating this potential confusion. However, recall that we don't want to force verbosity in Tween creation. The Tween is the core concept in our library, so we want to make construction convenient for the client. The builder syntax is verbose and requires a number of keystrokes similar to the single object parameter approach discussed earlier, which we discounted on account of its verbosity. I will say that I like is that the builder ends with `start`. There is a reason I chose `start` over something standard like `build`. The `start` better hints at the fact that tweens start immediately upon construction, which is something that our constructor nor or our initial (option-less) builder syntax implied.

Any of these will work, with me preferring the last iteration. However, we're running into common problems here: verbosity and unintuitive ordering. I made a mistake when coming up with the initial syntax. I was inspired by existing libraries, but I failed to consider *why* they go with their approaches. tween.js has the `start` method which avoids of the ambiguity of when a tween starts. It is also willing to provide it's own (non-configurable) defaults for duration and easing if they aren't before `start` is called. `to` is also optional--the tween will just do nothing if `to` is never called. I can't imagine this ever being desirable, but it simplifies implementation (step-builders require a lot of code to implement). For @Createjs, it makes sense for the options to be the second parameter of `get`. That's because this library aims to make sequencing animations of an object simple and concise. Consider this example from the documentation of the `Tween` class:

```ts
// minimal example
createjs.Tween.get(target).to({alpha: 0});

// example with config
createjs.Tween.get(target, {override: true})
    .wait(500)
    .to({alpha:0, visible:false}, 1000, 'linear')
    .call(handleComplete);
// Waits 500ms, tweens over 1000ms, then calls handleComplete. The override opt removes existing tweens targeting our target.
```

We can consider the tween to be ready and built right after the call to `get`, so `get` has to have the options that affect the target. I also completely overlooked at that the more fundamental options of the duration and easing are actually included as optional parameters in `to`.

#### Addressing verbosity and inconvenience

Initially I was okay with the verbosity of the builder syntax because the constructor remained there as an alternative. However, you may recall that when I thought of having `start` be the end of a builder, I noticed that the constructor doesn't communicate that a tween starts running at the beginning of existence. We considered hiding the constructor, but also considered that this removes the only concise way of creating a tween. However, the builder needn't be so verbose. Consider:

```tsx
tween(target, dest, easing, 500, opts);
```

It could be that simple. It is just the constructor syntax hidden behind a static factory function. We still have an action verb that communicates (well-enough) that tweening starts immediately.

However, consider the case were the case where `dest` is not a named variable. We might see something like this:

```ts
tween(dot, {
    position: {
        x: 0,
        y: 0,
    }
}, Easing.Linear, duration, opts);
```

This is pretty awkward. Sure, it can avoided by storing the destination in a named variable like we did with `dest`, but we see what we give up when we don't have a builder syntax.

We could choose to still include the step-builder syntax, but it would be another thing to maintain. I still like the idea of a tween factory, which could help reduce verbosity, so let's make something like this possible:

```ts
const lightTweenFactory = factory({easing, duration: 500, ...otherOpts});

const turnOnLight = () => lightTweenFactory(light, {brightness: 1.0});
const turnLightBackOff = () => lightTweenFactory(light, {brightness: 0}, {duration: 200}); // go faster than factory default.
```

Now we have a default-config-providing factory syntax without having to resort to some sort of globally-visible, mutable singleton like GSAP does or asking the client to write one themselves. However, unless we make easing/duration/opts always mandatory for the `factory` function, typing this probably wouldn't be so simple, though it probably could be done.

Mutability adds complication to any code, and it doesn't help that tweens are inherently stateful. A tween is a value that changes overtime. A Tween object writes directly its starting point[^1] (which is why we refer to it as the `target` rather than something like `start`).  Finally, our construction syntax figured out (barring problems within other parts of the library), we can move onto issues tweens can potentially have.

One more potential thing to consider is using a normal builder rather than a safer step-builder. Consider the `lightTweenFactory` example just above. What if we could just do something like this:

```ts
const lightTweenFactory = factory()
	.easing(easingValue)
	.duration(duration);
	.opts(opts);

const turnOnLight = () => lightTweenFactory.tween(light, {brightness: 1.0});
const turnOffLight = () => lightTweenFactory.duration(200).tween(light, {brightness: 0});
```

Of course, the obvious disadvantage of this is that its easy to forget to specify easing or duration, in which case we would have to throw an error at runtime. We may be able to stop this with clever use of the type system, but there likely is not a way for the compiler to give a particular error message when an option is missing. It would likely just say that `tween` is not a member on the factory.

Personally, I like the original design of the `factory` function. To keep things simple at the cost of a little client-flexibility, we always make easing and duration required in `factory`.

### (Our first approach at) dealing with conflict

Before we move into the API of a constructed `Tween`, we should reevaluate our design so far and look for things that might limit what is reasonable to include in the API. Recall the earlier example of animating the reorganization (or collating) of a player's hand after a card is removed from it. What if, before the animations are complete, the player puts down another card? For each card remaining in the player's hand, we have two tweens active and targeting the same object. The simple thing to do is have the later animation take priority. On each update cycle, the first tween will perform its update and then the second will perform its updates and overwrite any properties that both tweens and interpolating. In our hand of cards example, this will result in correct-looking behavior. However, we can still get odd behavior:

```ts
const circle = {radius: 1, x: 0, y: 0};
const moveRightUp = tween(circle, {x: 3, y: 3}, Easing.Linear, 1000);
const moveDown = tween(circle, {y: -3}, Easing.Linear, 500);
```

`moveDown` will take over for the y-coordinate, but, once it finishes, it will release the y-coordinate and it will suddenly jump up and continue being moved up by `moveRightUp`. I am unable to imagine a scenario where a client would want this kind of behavior, so we'll have to do something a little more nuanced. We can have later-created tweens block earlier tweens from writing to properties both tweens target. Note that the earlier tween will continue to update properties that the later tween does not touch.

For many situations, at least the ones I expect myself to encounter when using this library for my own projects, this behavior would generally be what I want `circle` will get where I want it to go. However, there could be times where this is undesirable. Reexamining the same example, let's pretend that we never want circle to touch the point (1, -1) for some reason (maybe there's a wall there). If we have these two tweens to happen in sequence (`moveDown` does not start until `moveRightUp` finishes), then the circle will go around our no-go-zone. If, however, `moveDown` starts right after `moveRightUp` (or close to it), the circle will move right through the no-go-zone. For this scenario, I am OK with just labelling the code as incorrect. The syntax used does not imply that two tweens are guaranteed to apply in-sequence. However, this does highlight how sequencing might be a common enough behavior for us to support, rather than forcing clients to write their own.

At this point I am happy with the (partial) overriding behavior--though it might be a little difficult to implement. All tweens need to be able to communicate with each other, which is probably going to necessitate some global mediator object.

###  Tween features (messing with tweens post-creation)

Let's try adding some more features to our tween objects. Right now, we can't do anything to modify a tween once it is created. Let's consider some fundamental options like canceling, listenable events, pausing, resuming, and seeking.

##### Canceling

We want a way to stop a tween. We can just have a `cancel` method. It will stop future updates from the tween, though the changes made so far will not be reverted.

##### Events

We can provide some listenable events on tweens. We keep things simple by using an `EventEmitter` style syntax.

```ts
tween.on('completed', () => {});
tween.on('updated', (dt: number) => {});
tween.on('canceled', () => {}); // Fires if user calls cancel. Note that a complete overriden from another tween does not cancel this tween.
tween.on('conflict', (otherTween, type) => {}); // Maybe client wants respond to conflicts (i.e. error). We could even add a built-in option for erroring when a conflict occurs. If the client wants this behavior on all their tweens, our `factory` method would make this convenient.
tween.on('completedOrCanceled', () => {});
```

The comment in this made me think of something else that could be useful...adding events to factories:

```ts
const factory = Tween.factory(config);
factory.on('completed', (tween) => {});
factory.on('canceled', (tween) => {});
factory.on('conflict', (tween1, tween2, type) => {}); // Instead of having config have `errorOnConflict` set to `true`, the client could add an event handler here that throws the error (and maybe does some logging, recovery, etc.). One could argue the `type` parameter is just begging more `conflict...` events instead, but I'd like to keep the event list smaller.
factory.on('created', (tween) => {});
```

We'll put this down as a nice-to-have. Let's get back on-track.

One handy thing that the `updated` event allows tweens to is to tween strings. That may sound odd, but consider this example:

```ts
const box: HTMLElement = makeBox();
function animateBox(x: number, y: number, duration: number) {
    Tween.tween(getCurrentBoxCoords(), {x, y}, Easing.Linear, duration).on('updated', (coords) => {
    	box.style.setProperty('transform', `translate(${coords.x}px, ${coords.y}px)`);
	});
}
```

This is cool, but remember that override behavior we decided on? Consider this:

```ts
animateBox(100, 200, 1000);
aniamteBox(-100, -200, 500);
```

`getCurrentBoxCoords` probably makes a new object when it is called. That means we have two tweens that, in thought, target the same object; but, in reality, don't. This use of a tween results in different behavior than our previous conflict examples, because the library won't be able to detect a conflict. This also means that the `conflict` even won't get raised. This will be a continuing problem with giving clients control over tweens.

As if this was bad enough, other events pose more problems. Recall that its possible that a tween completely overrides another (if `target`s are equal and `destination`s have the same shape). What if we are listening to `complete` on the first tween? If we were to implement tweens in straightforward way, `complete` would get raised by first tween when its timer hit the end, even if the tween is impotent (the new tween will not `cancel` the old one). Then again, can we really call the tween *complete* when, for all intents and purposes, it got completely overridden and thus may as well be removed from thought? Consider the playing card example again. Say we do something like this:

```ts
class CardAnimator {
    private updatePlayerHand(): Tween<Card> { /* ... */ }
    public playCardFromPlayerHandAt(index: number): Tween[]; // Weird to not return a composite object instead--but 
    												     // fine for this example.
}

class CardGameUi {
    /* ... */
    
    public playCardAt(index: number) {        
        this.game.playCard(index); // Update game state.
        this.disableCardInteractions(); // Let's say we want to disallow picking another card to play until our animation finishes.
        this.cardAnimator.playCardFromPlayerHandAt(index)[0].on('complete', () => {
            this.enableCardInteractions();
        });
    }
}
```

Let's say we go the easy way (and the way most developers would expect, I imagine) and have `completed` be raised at whenever the original animation *would have* finished. If we call `playCardAt`, and then call it again before the first set of tween complete, card interactions will get enabled early! We have to ask ourselves 1) is this programmer error and 2) could we do something to help prevent this without losing out somewhere else? I'm thinking the answers are 1) yes and 2) nothing I can easily think of. If the programmer observes this bug and then goes to read the code carefully enough, this misbehavior would hopefully be apparent. However, let's say have `complete` never raise if the tween gets completely overridden. Now the code works again, but someone reading the code who isn't familiar with the library might have false alarms go off in their head (and fairly so!). When they test the game and don't observe the bug they were expecting, they will get confused. They may decide that, even if it's magically working, they should still go in and "fix" the code. Them "fixing" the code by adding explicit `cancel` calls to the last set of tweens won't cause any harm (provided the fixer doesn't accidentally break something) other than wasting their time. To conclude this example, not raising `complete` is not necessarily a bad thing, but is it intuitive? Not to mention, there still may be other scenarios where code may rely on a `complete` that never happens. The above could still be rewritten. We have `CardAnimator` hide its implementation by returning its own event-emitting object rather than a tween. This EE would also have a `complete` event but would only get called when the animation actually gets to complete.

The problem here is that it is very difficult if not impossible to determine what exactly the programmer intended when we run into weird situations. It is fair to assume that two tweens conflicting with each other at the same update is wrong, but we can't just cancel tweens since other code may be depending on events to get emitted. We have to let all the tweens run, but just ignore updates coming from older tweens.

##### Pausing/resuming

Since we've settled on later-created tweens always getting their way when there is ever a conflict, the potential conflicts of pausing/resuming that I could think of go away.

```ts
const circle = {radius: 1, x: 0, y: 0};
const moveRightUp = tween(circle, {x: 3, y: 3}, Easing.Linear, 1000);
// later, but before moveRightUpFinishes
moveRightUp.pause();
// later
const moveDown = tween(circle, {y: -3}, Easing.Linear, 500);
moveDown.onComplete(() => moveRightUp.resume());
```

The potential conflict would be that `moveRightUp.resume()` results in the y-coordinate suddenly jumping back down to wherever it was when `moveRightUp.pause` happened and ending up at y=3. This is questionable both because of the sudden jump and because `moveDown` represents arguably the most up-to-date transformation of `circle`, yet the "old" transformation essentially overrides this. However, our library currently `moveDown`'s creation cancels the y-transformation entirely--this won't happen; so, this seems OK. Consider this example though: 

```ts
const light = {brightness: 0};
// Client wants to create a tween ahead of time and save it for later for some reason.
const turnLightSlowlyOnFromOff = factory.tween(light, {brightness: 1.0}).pause(); // Snapshots starting value as {brightness: 0}
// later ...
factory.tween(light, {brightness: 0}); // some other code turns light off.
// later after this completes, we want to turn the light on again
turnLightSlowlyOnFromOff.resume(); // Unless factory specifies errorOnConflict=true, this silently does nothing because turnLightOff overrided this tween which is now a no-op.
// This could lead a whole chain of bizze
```

We could chalk this up as a misuse of the `pause`/`resume` methods and move on. Other libraries would have `turnLightSlowlyOnFromOff` work as programmed. Unfortunately, we cannot guess the client's intent with situations like these. Even if we made this behavior configurable (which is a lot more work), we need to settle on a default. While I also don't see much purpose in saving animations for later rather than creating them as they are needed (which is easier to follow, imo), this demonstrates another lurking problem within our approach.

##### Seeking/Looping

Take the same example but remove the `.pause()` and replace `.resume()` with `.seek(0)`. Let's consider looping. I don't even need to come up an example to start seeing problems. We could easily construct a loop, but then a new tween could override it and cause confusion.

```ts
const turnOnLight = /* ... */;
// later after turnOnLight finishes...
const turnOffLight = /* ... */;
// after turnOffLight finishes...
turnOnLight.loop(); // Should this revive turnOnLight as it were a new tween?
// What if we call turnOnLight.loop() before turnOffLight finishes? I guess turnOnLight should win.
```

What we could do is have `resume` and `loop` result in the same behavior as creating a new tween. This is what's *probably* always desired. 

But I have to admit it--**we have a problem**. It is clear that being able to modify or extend a tween's behavior post-creation can result in all sorts of problems. We could replace `pause`,`resume`, and `seek` with optional parameters. To pause a tween, `cancel` it and recreate the same tween providing a `startAtTime` value. `seek` could also be implementing in a similar way. But this seems silly though. If a client wants to pause a tween, they are going to do it (or use a different library) themselves. Their own version of `pause`/`resume` would just create a new tween, so let's just keep might as well just keep the methods and have them work as if they created new tweens. Regardless, these kind of issues make it apparent why many tweening libraries, like GSAP (starting in v3), take a completely hands-off approach and lets tweens fight. By default, there is no partial or total overriding when tweens share targets. With this approach, there is no magic. Tweening happens exactly as the client writes it, even if we ran into logic that we are pretty darn sure makes no sense. Also--to be completely honest--implementing and maintaining all these exceptions to the rule seems like nightmare. Sure, our original auto-canceling behavior made sense before we introduced more functionality and it would have been nice for short toy-demos, but I am now partial towards going with the GSAP approach. If we run into weird jumps due to an earlier tween be longer in duration than a newer one--that shouldn't be too hard to identify and debug; if it isn't, I would imagine that the client code is quite a mess.

> We now instead choose to have conflicting tweens continue to run. Newer tweens will still take priority multiple are running, but old tweens will still ultimately win if they are running when newer tweens are no longer running for any reason.

One thing that can mitigate protentional oddities in looping/repeating is to ask for this information to be declared at construction time. I can't imagine many times where we wouldn't know at construction time whether or not we are looping. Let's scrap the methods and have replace them with options. We could do this with most additional features I can think of.

## Composite animations

### Sequences

With our central module `Tween` figured out. Let's make basic sequencing easier for clients. Since tweens can be messed with post-creation, one constraint we might want to impose on sequences to keep things simpler is that sequences cannot be made from existing tweens. A sequence will be solely responsible for the lifetime of its tweens. We need to act a syntax to enable this. We could do this by having `Sequence` use factory methods:

```ts
const sequence = sequence()
				.tween(circle, {x: 5}, Easing.Linear, 500)
				.tween(circle, {y: 5}, Easing.Linear, 500)
				// Snapshotting of initial values do not occur each step is reached.
```

Some shortcomings:

* We might want have additional options to `tween` that are specific to sequencing, so we'd add this as another optional options parameter. However, we would have up to 6 parameters per call. If we didn't want to specific any special tween options, but wanted to provide sequencing options, we would be forced to pass `{}` as the 5th parameter. Having so many parameters is a pretty big cognitive load, and forcing the passing of empty values for unused parameters is a bit fishy. 

* We have to support the 3-parameter syntax as well. Having sequence have to be aware of and up-to-date with all of tween's construction syntax is annoying.

* No support for factories. I suppose we could do something like this:

  ```ts
  sequence().tweenFromFactory(factory, circle, {x: 5}, factoryOptsOverrides, sequencingOpts);
  ```

  This doesn't look pleasant, and has the same problem.

* What if we want to be able to include other sequences as subsequences in this one? We can't copy over the construction syntax for a sequence, because it isn't just one function call. I have an idea: `describe()`.

  ```ts
  const seq1Descriptor = describe().sequence()
  	.add(...tween1stuff)
  	.add(...tween2stuff);
  
  const seq = sequence()
	.add(seq1Descriptor)
  	.add(circle, {x: 5}, Easing.Linear, 500);
  ```
  

Of course, it's simplest (even if most dangerous) to let clients add sequences and subsequences directly. Yes, they could save references to them and mess with them while the sequence is running; but, if they were doing something like that instead of interacting with the `sequence` directly, they are asking for trouble.

```ts
// The second tween starts ~300 ms before the end of the first one (error if first tween is <300ms).
sequence()
    .add(factory.tween(circle, {x: 0})
    .add(factory.tween(circle, {x: 0}), {offset: -300});
```

### Timelines

While the sequence should cover most needs. It is possible to want to have multiple tweens be considered as a single sequence element.

```ts
// Suppose both tweens are 250ms long. Second param of add is the start time.
const secondTweenStartTime = 250;
const timeline = timeline()
	.add(someTween)
	.add(anotherTween, secondTweenStartTime);
```

When `timeline` becomes active in a sequence, `someTween` will start immediately and `anotherTween` will start 250ms later. The `timeline` is not considered complete until both `someTween` and `anotherTween` complete. In this case, this takes 500ms. We could actually achieve the same thing with `sequence` with a negative offset on the second tween. The syntax so far is very similar. We could ideally have timeline just delegate the work to sequence, but recall that an outside force could tamper with the true duration of a tween. In a sequence, increasing the duration of the first tween would delay the start of the second tween by that amount. In a timeline, the second tween's start time would not be affected.

At this point, we have some rough ideas that can guide the design of the final API. I think this design meets the stated goals minus the guardrails/safety part. Unfortunately, it's hard to put guardrails into place without severely limiting the addition of other features as we have discovered, so we chose to trade that goal off.

A potential concern that randomly came to mind is what if the client adds a tween to two different composites that run concurrently? This is a whole can of worms, and it's hard to interpret the client's intent in such a situation (and how to handle it). I don't really care to have a graceful response to this situation, as it require a lot more implementation detail and the client may be just as surprised by how we deal it as they are their own code that caused the situation to begin with.

## Noteworthy implementation detail

Since Tweens, Sequences, and Timelines will be composable into the two composite types and share some common methods (e.g. pause, resume, seek, and likely some hidden one for update), we expect for them to share a common interface and perhaps even an (abstract) superclass.

I think the term "Animation" is a good for representing both concepts. `Animation` will the common interface both classes implement.

```ts
 interface Animation {
    pause();
    resume();
    readonly paused: boolean;
    seek(time: number);
    _update(time: number); // Same as seek, but for internal use only.
}
```

We will still expose the `Tween` and the composite types as there is no problem with clients depending on the implementations directly. Constructors are not exposed and, if the implementations change, we are probably working on the next major version anyway.  `Animation` will be mostly for internal use, and maybe will be exposed through methods on the composite types (e.g. `Sequence.getActiveAnimation`).

Sequence and Timeline share a uniqueness from Tween in that they are composite animations. These will probably share some interface and perhaps some implementation.

It's possible to put guardrails in place to prevent multiple composites from working with the same animation, (i.e. each animation may only have one parent). We could, for example, add a rule that limits an animation to having only one active parent. Two parents actively updating the same animation at the same time is surely an error.

## Takeaways

* Don't copy (parts of) designs without questioning why they went the way they did. @tsdotnet's implementation of partial-overriding by default makes sense given the lack of tween life-cycle control methods as well as the fact it was developed with tweening threejs objects (thus never having to deal with the box `onUpdate` example problem we saw earlier).
* Adding lots of guardrails can take a lot of time. A system to detect conflicting tweens doesn't sound easy to get working (in a way that is performant). This library started out as just a tiny one for me to use for my own threejs animations. All I wanted was to have a tweening library that was typed and allowed me to be able to stick more than one event handler on a tween event without silently overwriting the other one. I was probably would have been better off either 1) working with existing libraries to improve/fix their typings or 2) writing my own typings for a library and having my own library just be a wrapper that fixes my major grievances with the other.
* There is a balance between library ability, safety, and implementation complexity. The addition of life cycle methods and events reduced the safety of the code. The client can do more with the tweens, and thus there are more things they can do horribly wrong with them. We might be able to put in error-detection; but it can be complex, only cover so many cases, and we might raise false errors.

# November Revisit

I have come back to this library because existing libraries still don't line up with my needs for Bastion Breach, and I want more practice with designing a library. I have reread through all my notes written so far.

[^1]: While writing to an input might initially set off alarms, it makes sense for tweens. Most of the time, all we want to do is write changes to the target right away. Creating copies for every update would be a waste of computation time and every tween would have to be accompanied by an update handler--most of which would just say "write these values to the target".
[^2]: It also makes minimum "getting started" examples simpler, which might make the library more marketable (via being simpler-to-use) even though the client code probably already has animation loop anyway that could just stick a `Tween.updateAll()` into.
[^3]: It turns out we can actually avoid this problem while forcing tweens to start immediately that I didn't think of until later. Keep reading and we'll get to it.