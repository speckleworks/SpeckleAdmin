<template>
  <v-layout row wrap>
    <v-flex xs12>
      Selected Objects:
      <v-btn flat icon small @click.native="hideSelectedObjects()" :color='"grey"'>
        <v-icon>remove_red_eye</v-icon>
      </v-btn>
      <v-btn flat icon small @click.native="unhideAllObjects()" :color='""'>
        <v-icon>remove_red_eye</v-icon>
      </v-btn>
      <v-btn flat icon small @click.native='toggleIsolation()' :color='selectedObjects.isolated ? "":"grey"'>
        <v-icon>location_searching</v-icon>
      </v-btn>
    </v-flex>
    <v-flex xs12>
      Section Box:
      <v-btn flat icon small @click.native="initSectionBox()">
        <v-icon>crop</v-icon>
      </v-btn>
    </v-flex>
    <v-flex xs12 class="caption" v-if="selectedObjectsId.length===0">
      There are no selected objects. You can select objects in the 3d model:
      <ul>
        <li>by clicking on them;</li>
        <li>by clicking on them and holding down shift;</li>
        <li>by holding down left shift and dragging a selection box on the screen.</li>
      </ul>
    </v-flex>
    <v-flex xs12>
      <object-details v-for="object in paginatedObjects" :key="object._id" :json="object"></object-details>
    </v-flex>
    <v-flex xs12>
      <v-btn icon small @click.native="pageNumber=0" :disabled="pageNumber===0">
        <v-icon>first_page</v-icon>
      </v-btn>
      <v-btn icon small @click.native="pageNumber-=1" :disabled="pageNumber===0">
        <v-icon>chevron_left</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.native="pageNumber+=1"
        :disabled="pageNumber >= Math.round(selectedObjects.length/sliceSize)"
      >
        <v-icon>chevron_right</v-icon>
      </v-btn>
      <v-btn
        icon
        small
        @click.native="pageNumber=Math.round(selectedObjects.length/sliceSize)"
        :disabled="pageNumber >= Math.round(selectedObjects.length/sliceSize)"
      >
        <v-icon>last_page</v-icon>
      </v-btn>
      <span
        class="caption"
        xxxstyle="position: relative;top:8px;"
      >{{pageNumber}} / {{(selectedObjects.length/sliceSize).toFixed(0)}}</span>
    </v-flex>
  </v-layout>
</template>
<script>
import ObjectDetails from "@/components/ViewerObjectDetails.vue";
import TransformControls from "three/examples/jsm/controls/TransformControls";
export default {
  name: "SelectedObjects",
  components: { ObjectDetails },
  props: {},
  watch: {
    selectedObjectsId(newVal) {
      this.currentIndex = 0;
      this.pageNumber = 0;
    }
  },
  computed: {
    selectedObjectsId() {
      return this.$store.state.selectedObjects;
    },
    selectedObjects() {
      if (this.$store.state.selectedObjects.length !== 0)
        return this.$store.state.objects.filter(
          o => this.$store.state.selectedObjects.indexOf(o._id) !== -1
        );
      return this.$store.state.objects;
    },
    paginatedObjects() {
      return this.selectedObjects.slice(
        this.currentIndex + this.pageNumber * this.sliceSize,
        this.sliceSize * (this.pageNumber + 1)
      );
    }
  },
  data() {
    return {
      currentIndex: 0,
      sliceSize: 5,
      pageNumber: 0
    };
  },
  methods: {
    hideSelectedObjects() {
      if (this.$store.state.selectedObjects.length !== 0)
        window.renderer.hideObjects(this.$store.state.selectedObjects);
    },
    unhideAllObjects() {
      window.renderer.showObjects([]);
      this.selectedObjects.isolated = false;
    },
    toggleIsolation() {
      if (this.selectedObjects.isolated) {
        window.renderer.showObjects(this.$store.state.selectedObjects);
        this.selectedObjects.isolated = false;
      } else {
        window.renderer.isolateObjects(this.$store.state.selectedObjects);
        this.selectedObjects.isolated = true;
      }
    },
    createPlaneStencilGroup ( geometries, plane, renderOrder ) {
      let group = new THREE.Group()
      let baseMat = new THREE.MeshBasicMaterial()
      baseMat.depthWrite = false
      baseMat.depthTest = false
      baseMat.colorWrite = false
      baseMat.stencilWrite = true
      baseMat.stencilFunc = THREE.AlwaysStencilFunc

      // back faces
      let mat0 = baseMat.clone()
      mat0.side = THREE.BackSide
      mat0.clippingPlanes = [ plane ]
      mat0.stencilFail = THREE.IncrementWrapStencilOp
      mat0.stencilZFail = THREE.IncrementWrapStencilOp
      mat0.stencilZPass = THREE.IncrementWrapStencilOp

      // front faces
      let mat1 = baseMat.clone()
      mat1.side = THREE.FrontSide
      mat1.clippingPlanes = [ plane ]
      mat1.stencilFail = THREE.DecrementWrapStencilOp
      mat1.stencilZFail = THREE.DecrementWrapStencilOp
      mat1.stencilZPass = THREE.DecrementWrapStencilOp

      for ( let geometry in geometries ) {
        let mesh0 = new THREE.Mesh( geometry, mat0 )
        mesh0.renderOrder = renderOrder
        group.add( mesh0 )

        let mesh1 = new THREE.Mesh( geometry, mat1 )
        mesh1.renderOrder = renderOrder
        group.add( mesh1 )
      }
      return group
    },
    addPlaneControls( po ) {
      let control = new TransformControls( this.camera, this.renderer.domElement )
      control.addEventListener( 'change', window.renderer.render )
      control.addEventListener( 'dragging-changed', function ( event ) {
        window.renderer.controls.enabled = !event.value
      } )
      control.attach( po )
      window.renderer.scene.add( control )
    },
    initSectionBox() {
      console.log("Click section box");
      console.log(window.renderer.scene.children);
      let object = new THREE.Group();
      window.renderer.scene.add(object);
      let geometries = [];
      for (let obj of window.renderer.scene.children) {
        if (obj.type === "Mesh") geometries.push(obj.geometry);
      }
      console.log("pass geometries");
      console.log(geometries);
      let defaultDistantToOrigin = 50000;
      let planes = [
        new THREE.Plane(new THREE.Vector3(-1, 0, 0), -defaultDistantToOrigin),
        new THREE.Plane(new THREE.Vector3(1, 0, 0), defaultDistantToOrigin),
        new THREE.Plane(new THREE.Vector3(0, -1, 0), -defaultDistantToOrigin),
        new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), defaultDistantToOrigin ),
        new THREE.Plane( new THREE.Vector3( 0, 0, - 1 ), -defaultDistantToOrigin ),
        new THREE.Plane( new THREE.Vector3( 0, 0, 1 ), defaultDistantToOrigin )
      ];
      let planeHelpers = planes.map(
        p => new THREE.PlaneHelper(p, 20000, 0xffffff)
      );
      planeHelpers.forEach(ph => {
        ph.visible = true;
        window.renderer.scene.add(ph);
      });
      let planeObjects = [];
      let planeGeom = new THREE.PlaneBufferGeometry(40000, 40000);
      for (let i = 0; i < 6; i++) {
        let poGroup = new THREE.Group();
        let plane = planes[i];
        let stencilGroup = this.createPlaneStencilGroup(geometries, plane, i + 1);
        // plane is clipped by the other clipping planes
        let planeMat = new THREE.MeshStandardMaterial({
          color: 0xe91e63,
          metalness: 0.1,
          roughness: 0.75,
          clippingPlanes: planes.filter(p => p !== plane),
          stencilWrite: true,
          stencilRef: 0,
          stencilFunc: THREE.NotEqualStencilFunc,
          stencilFail: THREE.ReplaceStencilOp,
          stencilZFail: THREE.ReplaceStencilOp,
          stencilZPass: THREE.ReplaceStencilOp
        });
        let po = new THREE.Mesh(planeGeom, planeMat);
        po.onAfterRender = function(renderer) {
          renderer.clearStencil();
        };
        po.renderOrder = i + 1.1;
        object.add(stencilGroup);
        poGroup.add(po);
        planeObjects.push(po);
        window.renderer.scene.add(poGroup);
        console.log(poGroup);
        addPlaneControls(poGroup);
      }
      window.renderer.render(window.renderer.scene, window.renderer.camera)
    },
  }
};
</script>
<style scoped lang='scss'>
</style>
