import * as THREE from 'three'
import OrbitControls from 'threejs-orbit-controls'

import Rainbow from 'rainbowvis.js'
import CH from 'color-hash'

import Axios from 'axios'
import EE from 'event-emitter-es6'
import flatten from 'flat'

import { Converter } from './SpeckleConverter.js'
// import TWEEN from 'tween.js'

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

    this.hoveredObject = null
    this.objectsToHighlight = [ ]

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
    this.scene.add( hemiLight )

    // let gridHelper = new THREE.GridHelper( 200, 20 );
    // this.scene.add( gridHelper )

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

    window.addEventListener( 'resize', this.resizeCanvas.bind( this ), false )
    window.addEventListener( 'mousemove', this.onTouchMove.bind( this ) )
    window.addEventListener( 'touchmove', this.onTouchMove.bind( this ) )

    this.render( )
  }

  animate( ) {
    requestAnimationFrame( this.animate.bind( this ) );
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

    this.checkIntersection( )
  }

  checkIntersection( ) {
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

  // add and remove objects
  loadObjects( { objs, zoomExtents } ) {
    objs.forEach( obj => {
      try {
        if ( Converter.hasOwnProperty( obj.type ) )
          Converter[ obj.type ]( { obj: obj }, ( err, threeObj ) => {
            threeObj.userData._id = obj._id
            threeObj.userData.properties = obj.properties ? flatten( obj.properties ) : null
            this.scene.add( threeObj )
          } )
      } catch ( e ) {}
    } )
  }

  unloadObjects( { objIds } ) {
    let toRemove = [ ]
    this.scene.traverse( obj => {
      if ( obj.userData._id )
        if ( objIds.indexOf( obj.userData._id ) !== -1 ) toRemove.push( obj )
    } )
    toRemove.forEach( object => {
      this.scene.remove( object )
    } )
  }

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
    console.log( `bounds: ${min}, ${max}.` )
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

  ghostObjects( objIds ) {
    this.scene.traverse( obj => {
      if ( !( obj.userData && obj.userData._id ) ) return
      if ( obj.userData.ghostMaterial ) return // means it's already ghosted
      if ( objIds.indexOf( obj.userData._id ) === -1 ) return

      obj.userData.ghostMaterial = obj.material // keep old ref
      obj.material = obj.material.clone( ) // break ref
      obj.material.opacity = 0.1 // change opacity
      obj.premultipliedAlpha = true
      obj.renderOrder = 1
      // obj.material.wireframe = true
    } )
  }
  unGhostObjects( objIds ) {}

  showObjects( objIds ) {}
  hideObjects( objIds ) {}

  highlightObjects( objIds ) {}
  unHighlightObjects( objIds ) {}

  zoomToObject( ) {}
  zoomExtents( ) {}

  computeSceneBoundingSphere( ) {}
  setFar( ) {}
  setCamera( ) {}
}
