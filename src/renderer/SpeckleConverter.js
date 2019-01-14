import * as THREE from 'three'

function argbToRGB( color ) {
  return '#' + ( '000000' + ( color & 0xFFFFFF ).toString( 16 ) ).slice( -6 )
}

let worldXY = {
   origin : {value: [0,0,0]},
   xdir : {value: [1,0,0]},
   ydir : {value: [0,1,0]},
   normal : {value: [0,0,1]}
}

function planeToPlane( geometry, plane1, plane2){
  let qX = new THREE.Quaternion()
  let qY = new THREE.Quaternion()
  let qZ = new THREE.Quaternion()
  // console.log("plane1:", plane1)
  // console.log("plane2:", plane2)
  qX.setFromUnitVectors(new THREE.Vector3(...plane1.xdir.value), new THREE.Vector3(...plane2.xdir.value))
  qY.setFromUnitVectors(new THREE.Vector3(...plane1.ydir.value), new THREE.Vector3(...plane2.ydir.value))
  qZ.setFromUnitVectors(new THREE.Vector3(...plane1.normal.value), new THREE.Vector3(...plane2.normal.value))
  let translateVector = [(plane2.origin.value[0]-plane1.origin.value[0]), (plane2.origin.value[1]-plane1.origin.value[1]), (plane2.origin.value[2]-plane1.origin.value[2])]
  geometry.applyMatrix( new THREE.Matrix4( ).makeRotationFromQuaternion( qX ) )
  // geometry.applyMatrix( new THREE.Matrix4( ).makeRotationFromQuaternion( qY ) )
  // geometry.applyMatrix( new THREE.Matrix4( ).makeRotationFromQuaternion( qZ ) )
  geometry.translate(...translateVector)
}

export default {
  Point( args, cb ) {
    let geometry = new THREE.Geometry( )
    geometry.vertices.push( new THREE.Vector3( ...args.obj.value ) )
    let point = new THREE.Points( geometry, args.layer.threePointMaterial )
    cb( null, point )
  },

  Vector( args, cb ) {
    let v = new THREE.Vector3( ...args.obj.value )
    //if there's an origin in object.properties, render the vector as a line
    if (args.obj.properties){
      if (args.obj.properties.origin) {
        origin = new THREE.Vector3(...args.obj.origin)
        let geometry = new THREE.Geometry()
        geometry.vertices.push(v)
        geometry.vertices.push(origin)
        let line = new THREE.Line( geometry, args.layer.threeLineMaterial )
        line.hash = args.obj.hash
        cb( null, line )
      }
    }
    //otherwise warn the user
    console.warn( "Can't render vectors without an origin point" )
  },

  Plane( args, cb ) {
    //make planeSize a setting in the viewer
    let planeSize = 20
    let v1 = new THREE.Vector3( 0, 0, 1 )
    let v2 = new THREE.Vector3( ...args.obj.Normal.value )
    let q = new THREE.Quaternion( )
    q.setFromUnitVectors( v1, v2 )
    let geometry = new THREE.PlaneGeometry( planeSize, planeSize )
    let plane = new THREE.Mesh( geometry, args.layer.threeMeshMaterial )
    plane.geometry.applyMatrix( new THREE.Matrix4( ).makeRotationFromQuaternion( q ) );
    plane.geometry.applyMatrix( new THREE.Matrix4( ).makeTranslation( ...args.obj.Origin.value ) );
    plane.hash = args.obj.hash
    cb( null, plane )
  },

  Line( args, cb ) {
    let geometry = new THREE.Geometry( )
    geometry.vertices.push( new THREE.Vector3( args.obj.value[ 0 ], args.obj.value[ 1 ], args.obj.value[ 2 ] ) )
    geometry.vertices.push( new THREE.Vector3( args.obj.value[ 3 ], args.obj.value[ 4 ], args.obj.value[ 5 ] ) )
    let line = new THREE.Line( geometry, args.layer.threeLineMaterial )
    line.hash = args.obj.hash
    cb( null, line )
  },

  Rectangle( obj, cb ) {
    console.warn( 'TODO', args.obj.type )
  },

  Circle( args, cb ) {
    let origin = args.obj.center.value
    let radius = args.obj.radius
    let v1 = new THREE.Vector3( 0, 0, 1 )
    let v2 = new THREE.Vector3( ...args.obj.normal.value )
    let q = new THREE.Quaternion( )
    q.setFromUnitVectors( v1, v2 )
    let curve = new THREE.EllipseCurve( 0, 0, radius, radius, 0, 2 * Math.PI, false, 0 )
    let points = curve.getPoints( 50 )
    let geometry = new THREE.Geometry( ).setFromPoints( points )
    let circle = new THREE.Line( geometry, args.layer.threeLineMaterial )
    circle.geometry.applyMatrix( new THREE.Matrix4( ).makeRotationFromQuaternion( q ) );
    circle.geometry.applyMatrix( new THREE.Matrix4( ).makeTranslation( ...origin ) );
    circle.hash = args.obj.hash
    cb( null, circle )
  },

  Arc( args, cb ) {
    let radius = args.obj.radius
    let startAngle = args.obj.startAngle
    let endAngle = args.obj.endAngle
    let v1 = new THREE.Vector3( 0, 0, 1 )
    let v2 = new THREE.Vector3( ...args.obj.plane.normal.value )
    let q = new THREE.Quaternion( )
    q.setFromUnitVectors( v1, v2 )
    let curve = new THREE.EllipseCurve( 0, 0, radius, radius, startAngle, endAngle, false, 0 )
    let points = curve.getPoints( 50 )
    let geometry = new THREE.Geometry( ).setFromPoints( points )
    let arc = new THREE.Line( geometry, args.layer.threeLineMaterial )
    arc.geometry.applyMatrix( new THREE.Matrix4( ).makeRotationFromQuaternion( q ) );
    arc.geometry.applyMatrix( new THREE.Matrix4( ).makeTranslation( ...args.obj.plane.origin.value ) );
    arc.hash = args.obj.hash
    cb( null, arc )
  },

  Ellipse( args, cb ) {
    let xRadius = args.obj.firstRadius
    let yRadius = args.obj.secondRadius
    let startAngle = args.obj.startAngle
    let endAngle = args.obj.endAngle
    let v1 = new THREE.Vector3( 0, 0, 1 )
    let v2 = new THREE.Vector3( ...args.obj.plane.Normal.value )
    let q = new THREE.Quaternion( )
    q.setFromUnitVectors( v1, v2 )
    let curve = new THREE.EllipseCurve( 0, 0, radius, radius, startAngle, endAngle, false, 0 )
    let points = curve.getPoints( 50 )
    let geometry = new THREE.Geometry( ).setFromPoints( points )
    let arc = new THREE.Line( geometry, args.layer.threeLineMaterial )
    arc.geometry.applyMatrix( new THREE.Matrix4( ).makeRotationFromQuaternion( q ) );
    arc.geometry.applyMatrix( new THREE.Matrix4( ).makeTranslation( ...args.obj.plane.Origin.value ) );
    arc.hash = args.obj.hash
    cb( null, arc )
  },

  Extrusion( args, cb ) {
    let m = new THREE.Matrix4( )
    let mInverse = new THREE.Matrix4( )
    let xform = Object.values( args.obj.profileTransformation )
    m.fromArray( xform.slice( 0, 16 ) )
    m.transpose( )
    mInverse = m.clone( )
    mInverse.getInverse( m )
    let type = args.obj.profile.type
    let pts = [ ]

    this[ args.obj.profile.type ]( { obj: args.obj.profile, layer: args.layer }, ( err, obj ) => {
      obj.geometry.applyMatrix( mInverse )
      let values = obj.geometry.vertices
      for ( var i = 0, l = values.length; i < l; ++i ) {
        pts.push( new THREE.Vector2( values[ i ].x, values[ i ].y ) )
      }
    } )

    let shape = new THREE.Shape( pts )
    for ( var i = 1; i < args.obj.profiles.length; i++ ) {
      let holeProfile = null
      let holePts = [ ]

      this[  args.obj.profiles[ i ].type ] ( { obj: args.obj.profiles[ i ], layer: args.layer }, ( err, obj ) => {
        holeProfile = obj
      })

      holeProfile.geometry.applyMatrix( mInverse )
      holeProfile.geometry.vertices.forEach( function( vertex ) {
        holePts.push( new THREE.Vector2( vertex.x, vertex.y ) )
      } )
      let holePath = new THREE.Path( holePts )
      shape.holes.push( holePath )
    }

    let path = new THREE.LineCurve( args.obj.pathStart, args.obj.pathEnd )
    let extrudePath = new THREE.CurvePath( )
    extrudePath.add( path )
    let extrudeSettings = {
      amount: args.obj.length,
      bevelEnabled: false,
    }
    let geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings )
    geometry.applyMatrix( m )
    let extrusion = new THREE.Mesh( geometry, args.layer.threeMeshMaterial )
    extrusion.hash = args.obj.hash
    cb( null, extrusion )
  },

  Box( args, cb ) {
    // console.log(args.obj)
    let width = args.obj.xSize.end - args.obj.xSize.start
    let height = args.obj.ySize.end - args.obj.ySize.start
    let depth = args.obj.zSize.end - args.obj.zSize.start
    let origin = args.obj.basePlane.origin.value
    let v1 = new THREE.Vector3( 0, 0, 1 )
    let v2 = new THREE.Vector3( ...args.obj.basePlane.normal.value )
    let q = new THREE.Quaternion( )
    q.setFromUnitVectors( v1, v2 )
    let geometry = new THREE.BoxGeometry( width, height, depth )
    let box = new THREE.Mesh( geometry, args.layer.threeMeshMaterial )
    box.geometry.applyMatrix( new THREE.Matrix4( ).makeRotationFromQuaternion( q ) )
    box.geometry.applyMatrix( new THREE.Matrix4( ).makeTranslation( ...origin ) )
    box.geometry.verticesNeedUpdate = true
    box.hash = args.obj.hash
    cb( null, box )
  },

  Polyline( args, cb ) {
    //console.log( args.obj )
    let geometry = new THREE.Geometry( )
    if ( !args.obj.value ) return console.warn( 'Strange polyline.' )
    if ( args.obj.closed == true ) {
      args.obj.value.push.apply( args.obj.value, args.obj.value.slice( 0, 3 ) )
    }
    for ( let i = 2; i < args.obj.value.length; i += 3 )
      geometry.vertices.push( new THREE.Vector3( args.obj.value[ i - 2 ], args.obj.value[ i - 1 ], args.obj.value[ i ] ) )
    let polyline = new THREE.Line( geometry, args.layer.threeLineMaterial )
    polyline.hash = args.obj.hash
    cb( null, polyline )
  },

  Polycurve( args, cb ) {
    for ( let i in args.obj.segments ) {
      let segment = args.obj.segments[ i ]
      this[ segment.type ]( { obj: segment, layer: args.layer }, ( err, poly ) => {
        if ( err ) return cb( err )
        return cb( null, poly )
      } )
    }
  },

  Annotation( args, cb ) {
    console.warn( 'TODO', args.obj.type )
  },

  Curve( args, cb ) {
    this.Polyline( { obj: args.obj.displayValue, layer: args.layer }, ( err, poly ) => {
      if ( err ) return cb( err )
      return cb( null, poly )
    } )
  },

  Mesh( args, cb ) {
    let obj = args.obj
    let geometry = new THREE.Geometry( )
    for ( let i = 2; i < obj.vertices.length; i += 3 )
      geometry.vertices.push( new THREE.Vector3( obj.vertices[ i - 2 ], obj.vertices[ i - 1 ], obj.vertices[ i ] ) )

    let k = 0
    while ( k < obj.faces.length ) {
      // QUAD FACE
      if ( obj.faces[ k ] === 1 ) {
        geometry.faces.push( new THREE.Face3( obj.faces[ k + 1 ], obj.faces[ k + 2 ], obj.faces[ k + 3 ] ) )
        geometry.faces.push( new THREE.Face3( obj.faces[ k + 1 ], obj.faces[ k + 3 ], obj.faces[ k + 4 ] ) )
        k += 5
      }
      // TRIANGLE FACE
      if ( obj.faces[ k ] === 0 ) {
        geometry.faces.push( new THREE.Face3( obj.faces[ k + 1 ], obj.faces[ k + 2 ], obj.faces[ k + 3 ] ) )
        k += 4
      }
    }

    if ( args.obj.colors ) {
      geometry.faces.forEach( face => {
        let colorA = new THREE.Color( argbToRGB( args.obj.colors[ face.a ] ) )
        face.vertexColors.push( colorA )
        let colorB = new THREE.Color( argbToRGB( args.obj.colors[ face.b ] ) )
        face.vertexColors.push( colorB )
        let colorC = new THREE.Color( argbToRGB( args.obj.colors[ face.c ] ) )
        face.vertexColors.push( colorC )
      } )
    }

    geometry.computeFaceNormals( )
    geometry.computeVertexNormals( )

    let mesh = new THREE.Mesh( geometry, args.layer.threeMeshMaterial )
    mesh.hasVertexColors = false

    if ( args.obj.colors.length > 0 ) {
      mesh.hasVertexColors = true
      mesh.material = args.layer.threeMeshVertexColorsMaterial
    }
    mesh.hash = obj.hash

    return cb( null, mesh )
  },

  Brep( args, cb ) {
    this.Mesh( { layer: args.layer, obj: args.obj.displayValue }, ( err, obj ) => {
      if ( err ) return cb( err, null )
      return cb( null, obj )
    } )
  },

  Abstract( args, cb ) {
    // console.log( 'Soon™', args.obj.type )
    // console.log( args.obj )
    let loader = new THREE.FontLoader( )
    if ( args.obj._type.includes( 'Dimension' ) ) {
      let dimProps = args.obj.properties
      let extLineOffset = dimProps.ExtensionLineOffset
      let extLineExtension = dimProps.ExtensionLineExtension

      if (dimProps.DimensionLinePoint.properties.Y < 0){
        extLineOffset = -extLineOffset
        extLineExtension = -extLineExtension
      }
      //Draw the text
      loader.load( '/src/assets/helvetiker_regular.typeface.json', function (font){
        let geometry = new THREE.TextGeometry(dimProps.Text, {
          font: font,
          size: dimProps.TextHeight,
          height: 0
        })
        geometry.computeBoundingBox()
        let centerOffset = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x)
        geometry.translate(dimProps.TextPosition.properties.X + centerOffset, dimProps.TextPosition.properties.Y - extLineExtension, 0)
        planeToPlane(geometry, worldXY, dimProps.Plane)
        let dimText = new THREE.Mesh( geometry, args.layer.threeLineMaterial )
        dimText.hash = args.obj.hash
        cb( null, dimText )

      } )
      //Draw the extension lines
      //1st extension line
      let ext1Geo = new THREE.Geometry( )
      ext1Geo.vertices.push( new THREE.Vector3( dimProps.ExtensionLine1End.properties.X, dimProps.ExtensionLine1End.properties.Y + extLineOffset, 0 ))
      ext1Geo.vertices.push( new THREE.Vector3( dimProps.ExtensionLine1End.properties.X, dimProps.DimensionLinePoint.properties.Y + extLineExtension, 0))
      planeToPlane(ext1Geo, worldXY, dimProps.Plane)
      let ext1line = new THREE.Line( ext1Geo, args.layer.threeLineMaterial )
      cb( null, ext1line)

      //extension line 1 dot
      let ext1dotGeo = new THREE.CircleGeometry(dimProps.ArrowSize/3, 32)
      ext1dotGeo.translate(dimProps.ExtensionLine1End.properties.X, dimProps.DimensionLinePoint.properties.Y, 0)
      planeToPlane(ext1dotGeo, worldXY, dimProps.Plane)
      let ext1dot = new THREE.Mesh(ext1dotGeo, args.layer.threeLineMaterial)
      cb (null, ext1dot)

      //2nd extension line
      let ext2Geo = new THREE.Geometry( )
      ext2Geo.vertices.push( new THREE.Vector3( dimProps.ExtensionLine2End.properties.X, dimProps.ExtensionLine2End.properties.Y + extLineOffset, 0 ))
      ext2Geo.vertices.push( new THREE.Vector3( dimProps.ExtensionLine2End.properties.X, dimProps.DimensionLinePoint.properties.Y + extLineExtension, 0))
      planeToPlane(ext2Geo, worldXY, dimProps.Plane)
      let ext2line = new THREE.Line( ext2Geo, args.layer.threeLineMaterial )
      cb( null, ext2line)

      //extension line 2 dot
      let ext2dotGeo = new THREE.CircleGeometry(dimProps.ArrowSize/3, 32)
      ext2dotGeo.translate(dimProps.ExtensionLine2End.properties.X, dimProps.DimensionLinePoint.properties.Y, 0)
      planeToPlane(ext2dotGeo, worldXY, dimProps.Plane)
      let ext2dot = new THREE.Mesh(ext2dotGeo, args.layer.threeLineMaterial)
      cb (null, ext2dot)

      let dimLineGeo = new THREE.Geometry()
      dimLineGeo.vertices.push( new THREE.Vector3( dimProps.ExtensionLine1End.properties.X, dimProps.DimensionLinePoint.properties.Y, 0))
      dimLineGeo.vertices.push( new THREE.Vector3( dimProps.ExtensionLine2End.properties.X, dimProps.DimensionLinePoint.properties.Y, 0))
      planeToPlane(dimLineGeo, worldXY, dimProps.Plane)
      let dimLine = new THREE.Line( dimLineGeo, args.layer.threeLineMaterial)
      cb (null, dimLine)

    }
  }
}
