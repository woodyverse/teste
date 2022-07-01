/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';

/**
 * The main class of this app. All the logic goes here.
 */
export default class HelloWorld {
	private texto: MRE.Actor = null;
	private hostButton: MRE.Actor = null;
	private button: MRE.Actor = null;
	private seta: MRE.Actor = null;
	private buttons: MRE.Actor[] = [];
	private setas: MRE.Actor[] = [];
	private assets: MRE.AssetContainer;

	constructor(private context: MRE.Context) {
		this.context.onStarted(() => this.started());
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private async started() {
		// set up somewhere to store loaded assets (meshes, textures, animations, gltfs, etc.)
		this.assets = new MRE.AssetContainer(this.context);

		const hostButtonAsset = await this.assets.loadGltf('Botão_Azul.glb', "box");
		const buttonAsset = await this.assets.loadGltf('altspace-cube.glb', "box");
		const setAsset = await this.assets.loadGltf('Seta.glb', "box");

		// Create a new actor with no mesh, but some text.
		
		this.texto = MRE.Actor.Create(this.context, {
			actor: {
				name: 'Text',
				transform: {
					app: { position: { x: 0, y: 0.5, z: 0 } }
				},
				text: {
					contents: "Espere a pergunta!!!",
					anchor: MRE.TextAnchorLocation.MiddleCenter,
					color: { r: 30 / 255, g: 206 / 255, b: 213 / 255 },
					height: 0.3
				}
			}
		});

		this.hostButton = MRE.Actor.CreateFromPrefab(this.context, {
			// using the data we loaded earlier
			firstPrefabFrom: hostButtonAsset,
			// Also apply the following generic actor properties.
			actor: {
				name: 'Botão do Host',
				// Parent the glTF model to the text actor, so the transform is relative to the text
				
				transform: {
					local: {
						position: { x: 5, y: 3, z: 0 },
						scale: { x: 1, y: 1, z: 1 }
					}
				}
			}});

		const hostButtonBehavior = this.hostButton.setBehavior(MRE.ButtonBehavior);
	
		hostButtonBehavior.onClick(usuario => {

			this.texto.text.contents = 'Valendo!!!!';

			this.button = MRE.Actor.CreateFromPrefab(this.context, {
				// using the data we loaded earlier
				firstPrefabFrom: buttonAsset,
				// Also apply the following generic actor properties.
				actor: {
					name: 'Botao Plateia',
					// Parent the glTF model to the text actor, so the transform is relative to the text
					parentId: this.texto.id,
					transform: {
						local: {
							position: { x: 0, y: -1, z: 0 },
							scale: { x: 0.4, y: 0.4, z: 0.4 }
						}
					}
				}
			});
			//this.buttons.push(cubo);
			
			//flipAnim.play();
		});
		// Here we create an animation for our text actor. First we create animation data, which can be used on any
		// actor. We'll reference that actor with the placeholder "text".
		const spinAnimData = this.assets.createAnimationData(
			// The name is a unique identifier for this data. You can use it to find the data in the asset container,
			// but it's merely descriptive in this sample.
			"Spin",
			{
				// Animation data is defined by a list of animation "tracks": a particular property you want to change,
				// and the values you want to change it to.
				tracks: [{
					// This animation targets the rotation of an actor named "text"
					target: MRE.ActorPath("text").transform.local.rotation,
					// And the rotation will be set to spin over 20 seconds
					keyframes: this.generateSpinKeyframes(20, MRE.Vector3.Up()),
					// And it will move smoothly from one frame to the next
					easing: MRE.AnimationEaseCurves.Linear
				}]
			});
		// Once the animation data is created, we can create a real animation from it.
		spinAnimData.bind(
			// We assign our text actor to the actor placeholder "text"
			{ text: this.texto },
			// And set it to play immediately, and bounce back and forth from start to end
			{ isPlaying: true, wrapMode: MRE.AnimationWrapMode.PingPong });

		// Load a glTF model before we use it
		
		// spawn a copy of the glTF model
		
		//this.buttons.push(button);

		// Create some animations on the cube.
		const flipAnimData = this.assets.createAnimationData(
			// the animation name
			"DoAFlip",
			{ tracks: [{
				// applies to the rotation of an unknown actor we'll refer to as "target"
				target: MRE.ActorPath("target").transform.local.rotation,
				// do a spin around the X axis over the course of one second
				keyframes: this.generateSpinKeyframes(1.0, MRE.Vector3.Right()),
				// and do it smoothly
				easing: MRE.AnimationEaseCurves.Linear
			}]}
		);
		// apply the animation to our cube
		//const flipAnim = await flipAnimData.bind({ target: button });

		// Set up cursor interaction. We add the input behavior ButtonBehavior to the cube.
		// Button behaviors have two pairs of events: hover start/stop, and click start/stop.
		const buttonBehavior = this.button.setBehavior(MRE.ButtonBehavior);

		// Trigger the grow/shrink animations on hover.
		buttonBehavior.onHover('enter', () => {
			// use the convenience function "AnimateTo" instead of creating the animation data in advance
			MRE.Animation.AnimateTo(this.context, this.button, {
				destination: { transform: { local: { scale: { x: 0.5, y: 0.5, z: 0.5 } } } },
				duration: 0.3,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			});
		});
		buttonBehavior.onHover('exit', () => {
			MRE.Animation.AnimateTo(this.context, this.button, {
				destination: { transform: { local: { scale: { x: 0.4, y: 0.4, z: 0.4 } } } },
				duration: 0.3,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			});
		});

		// When clicked, do a 360 sideways.
		buttonBehavior.onClick(usuario => {

			this.texto.text.contents = usuario.name;

			const seta = MRE.Actor.CreateFromPrefab(this.context, {
				// using the data we loaded earlier
				firstPrefabFrom: setAsset,
				// Also apply the following generic actor properties.
				actor: {
					name: 'Seta Escolhido',
					// Parent the glTF model to the text actor, so the transform is relative to the text
					
					transform: {
						local: {
							position: { x: 0, y: 1.7, z: 0 },
							scale: { x: 0.4, y: 0.4, z: 0.4 }
						}
					},
					attachment: {
						attachPoint: 'head' , 
						userId: usuario.id
						
					}
				}
				
			});
			this.setas.push(seta);
			//this.button.destroy();
			//this.buttons.slice(1,1);
			
			//flipAnim.play();
		});
	}

	/**
	 * Generate keyframe data for a simple spin animation.
	 * @param duration The length of time in seconds it takes to complete a full revolution.
	 * @param axis The axis of rotation in local space.
	 */
	private generateSpinKeyframes(duration: number, axis: MRE.Vector3): Array<MRE.Keyframe<MRE.Quaternion>> {
		return [{
			time: 0 * duration,
			value: MRE.Quaternion.RotationAxis(axis, 0)
		}, {
			time: 0.25 * duration,
			value: MRE.Quaternion.RotationAxis(axis, Math.PI / 2)
		}, {
			time: 0.5 * duration,
			value: MRE.Quaternion.RotationAxis(axis, Math.PI)
		}, {
			time: 0.75 * duration,
			value: MRE.Quaternion.RotationAxis(axis, 3 * Math.PI / 2)
		}, {
			time: 1 * duration,
			value: MRE.Quaternion.RotationAxis(axis, 2 * Math.PI)
		}];
	}
}
