import * as THREE from 'three'
import OrbitControls from 'threejs-orbit-controls'

import Rainbow from 'rainbowvis.js'
import CH from 'color-hash'
import TWEEN from '@tweenjs/tween.js'

import Axios from 'axios'
import EE from 'event-emitter-es6'
import flatten from 'flat'

import { Converter } from './SpeckleConverter.js'
import SelectionBox from './SelectionBox.js'
import SelectionHelper from './SelectionHelper.js'

export default class SpeckleRenderer extends EE {

  constructor( { domObject } ) {
    super( ) // event emitter init
    this.domObject = domObject
    this.renderer = null
    this.scene = null
    this.camera = null
    this.controls = null
    this.orbitControls = null
    this.hemiLight = null
    this.flashLight = null

    this.raycaster = null
    this.mouse = null
    this.mouseDownTime = null
    this.enableKeyobardEvents = false

    this.selectionBox = null
    this.selectionHelper = null

    this.hoveredObject = null
    this.objectSelection = [ ]

    this.sceneBoundingSphere = null

    this.colorHasher = new CH( )

    this.initialise( )
  }

  initialise( ) {
    this.renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true } )
    this.renderer.setSize( this.domObject.offsetWidth, this.domObject.offsetHeight )
    // this.renderer.setClearColor( new THREE.Color(  ), 0.0 )
    this.renderer.shadowMap.enabled = true
    this.domObject.appendChild( this.renderer.domElement )

    this.scene = new THREE.Scene( )

    let axesHelper = new THREE.AxesHelper( 50 )
    this.scene.add( axesHelper )

    let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 )
    hemiLight.color = new THREE.Color( '#FFFFFF' )
    hemiLight.groundColor = new THREE.Color( '#959595' )
    hemiLight.position.set( 0, 500, 0 )
    hemiLight.isCurrent = true
    hemiLight.name = 'world lighting'
    hemiLight.up.set( 0, 0, 1 )
    this.scene.add( hemiLight )

    this.camera = new THREE.PerspectiveCamera( 75, this.domObject.offsetWidth / this.domObject.offsetHeight, 0.1, 100000 );
    this.camera.up.set( 0, 0, 1 )
    this.camera.position.z = 1000
    this.camera.isCurrent = true

    let flashlight = new THREE.PointLight( new THREE.Color( '#FFFFFF' ), 0.32, 0, 1 )
    flashlight.name = 'camera light'
    this.camera.add( flashlight )

    this.controls = new OrbitControls( this.camera, this.renderer.domElement )
    this.controls.enabled = true
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.45

    if ( webpackHotUpdate ) {
      window.scene = this.scene
      window.THREE = THREE
    }

    this.raycaster = new THREE.Raycaster( )
    this.mouse = new THREE.Vector2( )

    this.selectionBox = new SelectionBox( this.camera, this.scene )
    this.selectionHelper = new SelectionHelper( this.selectionBox, this.renderer, "selectBox", this.controls, this.mouse )


    window.addEventListener( 'resize', this.resizeCanvas.bind( this ), false )
    this.renderer.domElement.addEventListener( 'mousemove', this.onTouchMove.bind( this ) )
    this.renderer.domElement.addEventListener( 'touchmove', this.onTouchMove.bind( this ) )

    this.renderer.domElement.addEventListener( 'mousedown', this.mouseDown.bind( this ) )
    this.renderer.domElement.addEventListener( 'mouseup', this.mouseUp.bind( this ) )

    this.domObject.addEventListener( 'mouseover', this.enableEvents.bind( this ) )
    this.domObject.addEventListener( 'mouseout', this.disableEvents.bind( this ) )

    window.addEventListener( 'keydown', this.keydown.bind( this ) )
    window.addEventListener( 'keyup', this.keyup.bind( this ) )

    this.computeSceneBoundingSphere( )
    this.render( )
  }

  animate( ) {
    requestAnimationFrame( this.animate.bind( this ) );
    TWEEN.update( )
    this.controls.update( )
    this.render( )
  }

  render( ) {
    this.renderer.render( this.scene, this.camera );
  }

  resizeCanvas( ) {
    this.camera.aspect = this.domObject.offsetWidth / this.domObject.offsetHeight
    this.camera.updateProjectionMatrix( )
    this.renderer.setSize( this.domObject.offsetWidth, this.domObject.offsetHeight )
  }

  // called on mouseover the render div - tells us we can actually enable interactions
  // in the threejs window
  enableEvents( ) {
    this.enableKeyobardEvents = true
  }

  // called on mouseout of the render div - will stop interactions, such as spacebar
  // for zoom extents, etc. in the threejs window
  disableEvents( ) {
    this.enableKeyobardEvents = false
  }

  // HIC SUNT DRACONES:
  // Selection events and mouse interactions below.
  // Main thing to note:
  // - Holding down shift will disable the orbit controls and enable draggin a selection box
  // - Double clicking on an object will zoom to it
  // - (TODO) Clicking on an object selects it
  // - (TODO) Clicking outside any objects/selection box will kill current selection

  keydown( event ) {
    if ( !this.enableKeyobardEvents ) return
    console.log( `key: ${event.code}` )
    switch ( event.code ) {
      case 'Space':
        this.computeSceneBoundingSphere( )
        this.zoomExtents( )
        break
      case 'ShiftLeft':
        this.controls.enabled = false
        break
      default:
        break
    }
  }

  keyup( event ) {
    if ( !this.enableKeyobardEvents ) return
    console.log( `key: ${event.code}` )
    switch ( event.code ) {
      case 'ShiftLeft':
        this.controls.enabled = true
        break
      default:
        break
    }
  }

  mouseDown( event ) {
    if ( Date.now( ) - this.mouseDownTime < 300 ) {
      if ( this.hoveredObject !== null )
        this.zoomToObject( this.hoveredObject )
    }

    if ( this.controls.enabled === false )
      this.selectionBox.startPoint.set( this.mouse.x, this.mouse.y, 0.5 )

    this.mouseDownTime = Date.now( )
  }

  mouseUp( event ) {
    // check for single tap/click
    if ( Date.now( ) - this.mouseDownTime < 300 ) {
      // console.log( this.hoveredObject )
      // console.log( `select! multi? ${event.shiftKey} unselect? ${event.ctrlKey}` )

      if ( this.hoveredObject && this.selectionBox.collection.findIndex( x => x.userData._id === this.hoveredObject.userData._id ) !== -1 ) {
        // Inside the selection
        if ( event.ctrlKey ) {
          // TODO: remove from selection
        }
      } else {
        for ( var i = 0; i < this.selectionBox.collection.length; i++ ) {
          this.selectionBox.collection[ i ].material = this.selectionBox.collection[ i ].__oldMaterialPreMassHighlight
        }
        this.selectionBox.collection = [ ]
        this.emit( 'select-objects', [ ] )
      }

      if ( this.hoveredObject ) {
        if ( event.shiftKey ) {
          console.log( 'emit add to selection' )
          this.emit( 'select-add-objects', [ this.hoveredObject.userData._id ] )
        } else if ( event.ctrlKey ) {
          console.log( 'remove from selection' )
          this.emit( 'select-remove-objects', [ this.hoveredObject.userData._id ] )
        } else {
          console.log( 'emit single selection' )
          this.emit( 'select-objects', [ this.hoveredObject.userData._id ] )
        }
      }
    } else {
      if ( !this.controls.enabled ) {
        console.log( 'emit mass selection' )
        console.log( this.selectionBox.collection )
        this.emit( 'select-objects', this.selectionBox.collection.map( o => o.userData._id ) )
      }
    }
  }

  onTouchMove( event ) {
    let x, y
    if ( event.changedTouches ) {
      x = event.changedTouches[ 0 ].pageX
      y = event.changedTouches[ 0 ].pageY
    } else {
      x = event.clientX
      y = event.clientY
    }
    let rect = this.domObject.getBoundingClientRect( )
    x -= rect.left
    y -= rect.top
    this.mouse.x = ( x / this.domObject.offsetWidth ) * 2 - 1
    this.mouse.y = -( y / this.domObject.offsetHeight ) * 2 + 1

    // check if we're dragging a box selection
    if ( this.selectionHelper.isDown && !this.controls.enabled ) {
      for ( var i = 0; i < this.selectionBox.collection.length; i++ ) {
        this.selectionBox.collection[ i ].material = this.selectionBox.collection[ i ].__oldMaterialPreMassHighlight
      }
      this.selectionBox.endPoint.set( this.mouse.x, this.mouse.y, 0.5 );
      var allSelected = this.selectionBox.select( )
      for ( var i = 0; i < allSelected.length; i++ ) {
        allSelected[ i ].__oldMaterialPreMassHighlight = allSelected[ i ].material
        allSelected[ i ].material = Converter.materialManager.getMeshHighlightMat( )
      }
    }
    // if not, highlight a selected object
    else {
      this.highlightMouseOverObject( )
    }
  }

  highlightMouseOverObject( ) {
    this.raycaster.setFromCamera( this.mouse, this.camera )
    let intersects = this.raycaster.intersectObjects( [ this.scene ], true )
    if ( intersects.length > 0 ) {
      this.domObject.style.cursor = 'pointer'

      if ( intersects[ 0 ].object !== this.hoveredObject ) {
        if ( this.hoveredObject ) {
          this.hoveredObject.material = this.hoveredObject.__oldMaterialPreHover
        }
        this.hoveredObject = intersects[ 0 ].object
        this.hoveredObject.__oldMaterialPreHover = this.hoveredObject.material
        this.hoveredObject.material = Converter.materialManager.getMeshHighlightMat( )
      }
    } else {
      this.domObject.style.cursor = 'default'
      if ( this.hoveredObject ) {
        this.hoveredObject.material = this.hoveredObject.__oldMaterialPreHover
        this.hoveredObject = null
      }
    }
  }

  // adds a bunch of speckle objects to the scene. handles conversion and
  // computes each objects's bounding sphere for faster zoom extents calculation
  // of the scene bounding sphere.
  loadObjects( { objs, zoomExtents } ) {
    objs.forEach( ( obj, index ) => {
      try {
        if ( Converter.hasOwnProperty( obj.type ) )
          Converter[ obj.type ]( { obj: obj }, ( err, threeObj ) => {
            threeObj.userData._id = obj._id
            threeObj.userData.properties = obj.properties ? flatten( obj.properties ) : null
            threeObj.geometry.computeBoundingSphere( )
            this.scene.add( threeObj )
          } )
      } catch ( e ) {
        console.warn( `Something went wrong in the conversion of ${obj._id} (${obj.type})` )
      }

      if ( zoomExtents && ( index === objs.length - 1 ) ) {
        console.log( this.scene.children.length )
        this.computeSceneBoundingSphere( )
        this.zoomExtents( )
      }
    } )
  }

  // removes an array of objects from the scene and recalculates the scene bounding sphere
  unloadObjects( { objIds } ) {
    let toRemove = [ ]
    this.scene.traverse( obj => {
      if ( obj.userData._id )
        if ( objIds.indexOf( obj.userData._id ) !== -1 ) toRemove.push( obj )
    } )
    toRemove.forEach( ( object, index ) => {
      this.scene.remove( object )
      if ( index === toRemove.length - 1 ) {
        this.computeSceneBoundingSphere( )
        this.zoomExtents( )
      }
    } )
  }

  // entry point for any attempt to color things by their properties in the viewer
  // depending on the property, it will either call "colorByNumericProperty" or
  // "colorByStringProperty" (see below)
  colorByProperty( { propertyName } ) {
    let first = this.scene.children.find( o => o.userData && o.userData.properties && o.userData.properties[ propertyName ] )
    if ( !first ) {
      console.error( 'no prop found' )
      return
    }

    let isNumeric = !isNaN( first.userData.properties[ propertyName ] )
    console.log( `coloring by ${propertyName}, which is (numeric: ${isNumeric})` )

    if ( isNumeric ) this.colorByNumericProperty( { propertyName: propertyName } )
    else this.colorByStringProperty( { propertyName: propertyName } )
  }

  // attempts to color all objects  in the scene by a numeric property, computing its bounds
  // and generating a gradient from min (blue) to max (pinkish)
  colorByNumericProperty( { propertyName } ) {
    // compute bounds
    let min = 10e6,
      max = -10e6,
      foundObjs = [ ],
      toReset = [ ]
    for ( let obj of this.scene.children ) {
      if ( !( obj.userData && obj.userData.properties && obj.userData.properties[ propertyName ] ) ) {
        toReset.push( obj )
        continue
      }

      let value = obj.userData.properties[ propertyName ]
      if ( value > max ) max = value
      if ( value < min ) min = value
      foundObjs.push( obj )
    }

    if ( min === max ) {
      min -= 1
    }
    console.log( `bounds: ${min}, ${max} 🌈` )
    // gen rainbow 🌈
    let rainbow = new Rainbow( )
    rainbow.setNumberRange( min, max )
    rainbow.setSpectrum( '#0A66FF', '#FC4CA5' )

    foundObjs.forEach( obj => {
      let value = obj.userData.properties[ propertyName ],
        color = null

      if ( !isNaN( value ) )
        color = new THREE.Color( `#${rainbow.colourAt( value )}` )
      else
        color = new THREE.Color( '#000000' )

      obj._oldMaterial = obj.material

      this.setObjVertexColors( { obj: obj, color: color } )
    } )
  }

  // attempts to color all objects in the scene by a string property
  // uses colorHasher to get a hex color out of a string
  colorByStringProperty( { propertyName } ) {
    let toReset = [ ]
    for ( let obj of this.scene.children ) {
      if ( !( obj.userData && obj.userData.properties && obj.userData.properties[ propertyName ] ) ) {
        toReset.push( obj )
        continue
      }
      let value = obj.userData.properties[ propertyName ]
      let color = new THREE.Color( this.colorHasher.hex( value.toString( ) ) )
      obj._oldMaterial = obj.material
      obj.material = Converter.materialManager.getMeshVertexMat( )

      this.setObjVertexColors( { obj: obj, color: color } )
    }
  }

  // sets vertex colors on objects by their type (mesh, line, points)
  setObjVertexColors( { obj, color } ) {
    if ( obj.type === 'Mesh' ) {
      obj.material = Converter.materialManager.getMeshVertexMat( )
      obj.geometry.faces.forEach( face => {
        face.vertexColors[ 0 ].copy( color )
        face.vertexColors[ 1 ].copy( color )
        face.vertexColors[ 2 ].copy( color )
      } )
    }

    if ( obj.type === 'Line' ) {
      obj.material = Converter.materialManager.getLineVertexMat( )
      obj.geometry.vertices.forEach( ( v, i ) => { obj.geometry.colors[ i ].copy( color ) } )
    }

    if ( obj.type === 'Points' ) {
      obj.material = Converter.materialManager.getPointVertexMat( )
      obj.geometry.vertices.forEach( ( v, i ) => { obj.geometry.colors[ i ].copy( color ) } )
    }

    obj.hasVertexColors = true
    obj.geometry.colorsNeedUpdate = true
  }

  resetColors( ) {
    for ( let obj of this.scene.children ) {
      if ( !( obj._oldMaterial ) ) continue
      obj.material = obj._oldMaterial
    }
  }

  // TODO
  ghostObjects( objIds ) {}
  unGhostObjects( objIds ) {}

  // TODO
  showObjects( objIds ) {}
  hideObjects( objIds ) {}

  highlightObjects( objIds ) {
    let objs = this.scene.children.filter( o => objIds.includes( o.userData._id ) )
    objs.forEach( obj => {
      obj.__oldMaterialPreHighlight = obj.material
      obj.material = Converter.materialManager.getMeshHighlightMat( )
    } )
  }
  unHighlightObjects( objIds ) {
    let objs = this.scene.children.filter( o => objIds.includes( o.userData._id ) )
    objs.forEach( obj => {
      // obj.__oldMaterialPreHighlight = obj.material
      obj.material = obj.__oldMaterialPreHighlight
    } )
  }

  zoomToObject( obj ) {
    if ( typeof obj === 'string' ) {
      obj = scene.children.find( o => o.userData._id === obj )
    }
    if ( !obj ) return
    let bsphere = obj.geometry.boundingSphere
    // let r = bsphere.radius

    let offset = bsphere.radius / Math.tan( Math.PI / 180.0 * this.controls.object.fov * 0.5 )
    let vector = new THREE.Vector3( 0, 0, 1 )
    let dir = vector.applyQuaternion( this.controls.object.quaternion );
    let newPos = new THREE.Vector3( )
    dir.multiplyScalar( offset * 1.5 )
    newPos.addVectors( bsphere.center, dir )
    this.setCamera( {
      position: [ newPos.x, newPos.y, newPos.z ],
      rotation: [ this.camera.rotation.x, this.camera.rotation.y, this.camera.rotation.z ],
      target: [ bsphere.center.x, bsphere.center.y, bsphere.center.z ]
    }, 300 )
  }

  zoomExtents( ) {
    let offset = this.sceneBoundingSphere.radius / Math.tan( Math.PI / 180.0 * this.controls.object.fov * 0.5 )
    let vector = new THREE.Vector3( 0, 0, 1 )
    let dir = vector.applyQuaternion( this.controls.object.quaternion );
    let newPos = new THREE.Vector3( )
    dir.multiplyScalar( offset * 1.25 )
    newPos.addVectors( this.sceneBoundingSphere.center, dir )
    this.setCamera( {
      position: [ newPos.x, newPos.y, newPos.z ],
      rotation: [ this.camera.rotation.x, this.camera.rotation.y, this.camera.rotation.z ],
      target: [ this.sceneBoundingSphere.center.x, this.sceneBoundingSphere.center.y, this.sceneBoundingSphere.center.z ]
    }, 250 )
  }

  computeSceneBoundingSphere( ) {
    // console.log( 'computing bs', this.scene.children.length )
    let time = Date.now( )
    let center = null,
      radius = 0,
      count = null

    for ( let obj of this.scene.children ) {

      if ( !obj.userData._id ) continue
      if ( !obj.geometry ) continue

      if ( !center ) {
        center = new THREE.Vector3( obj.geometry.boundingSphere.center.X, obj.geometry.boundingSphere.center.Y, obj.geometry.boundingSphere.center.Z )
        radius = obj.geometry.boundingSphere.radius
        continue
      }
      center.add( obj.geometry.boundingSphere.center )
      center.divideScalar( 2 )
      let otherDist = obj.geometry.boundingSphere.radius + center.distanceTo( obj.geometry.boundingSphere.center )
      if ( radius < otherDist ) radius = otherDist
    }
    center ? center.divideScalar( 2 ) : null
    this.sceneBoundingSphere = { center: center ? center : new THREE.Vector3( ), radius: radius > 1 ? radius * 1.5 : 100 }
  }

  setFar( ) {}
  setCamera( where, time ) {
    let self = this
    let duration = time ? time : 350
    //position
    new TWEEN.Tween( self.camera.position ).to( { x: where.position[ 0 ], y: where.position[ 1 ], z: where.position[ 2 ] }, duration ).easing( TWEEN.Easing.Quadratic.InOut ).start( )
    // rotation
    new TWEEN.Tween( self.camera.rotation ).to( { x: where.rotation[ 0 ], y: where.rotation[ 1 ], z: where.rotation[ 2 ] }, duration ).easing( TWEEN.Easing.Quadratic.InOut ).start( )
    // controls center
    new TWEEN.Tween( self.controls.target ).to( { x: where.target[ 0 ], y: where.target[ 1 ], z: where.target[ 2 ] }, duration ).onUpdate( ( ) => {
      self.controls.update( );
      if ( this.x === where.target[ 0 ] )
        console.log( 'camera finished stuff' )
    } ).easing( TWEEN.Easing.Quadratic.InOut ).start( )
  }
}
