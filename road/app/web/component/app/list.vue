<template>
<div>
<el-row>
  <el-col :span="8">
    <el-button type="primary" @click="dialogVisible = true">创建文件夹</el-button>
    <el-dialog
  title="提示"
  :visible.sync="dialogVisible"
  width="30%"
  :before-close="handleClose">
  
  <el-input v-model="input" placeholder="请输入文件名"></el-input>
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="createFiles">确 定</el-button>
</el-dialog>
    
    <el-tree
  :props="props1"
  :load="loadNode1"
  lazy
  show-checkbox>
</el-tree>
  </el-col>
  <el-col :span="16">
        <div style="height: 700px; width: 100%" 
        id="forgeViewer"></div>
  </el-col>
</el-row>

</div>
</template>
<style>

</style>
<script type="text/babel">
/* eslint no-undef: "off"*/
let viewerApp;

export default{
  data() {
    return {
      props1: {
        label: 'name',
        children: 'zones',
        isLeaf: 'leaf'
      },
      dialogVisible: false,
      input: '',
      buckets: []
    };
  },
  mounted() {
    this.fetch();

    this.selectObject();
  },
  computed: {
  },

  methods: {
    createFiles() {
      this.$http.post('/api/forge/oss/buckets', {
        bucketKey: this.input,
      }).then(res => {
        if (res.data.errcode === 0) {
          this.$message({
            message: '创建成功',
            type: 'success'
          });
        } else {
          this.$message({
            message: '创建失败',
            type: 'warning'
          });
        }
      });
      console.log('创建文件夹', this.input);
      this.dialogVisible = false;

    },
    handleClose() {

      this.dialogVisible = false;
    },
    fetch() {
      this.$http.get('/api/forge/oss/buckets').then(res => {
        const buckets = res.data.list;
      });
    },
    loadNode1(node, resolve) {
      if (node.level === 0) {
        return resolve([{ name: 'region' }]);
      }
      if (node.level > 1) return resolve([]);

      setTimeout(() => {
        const data = [{
          name: 'leaf',
          leaf: true
        }, {
          name: 'zone'
        }];

        resolve(data);
      }, 500);
    },


    launchViewer(urn) {
      const options = {
        env: 'AutodeskProduction',
        getAccessToken: this.getForgeToken
      };
      const documentId = 'urn:' + urn;
      Autodesk.Viewing.Initializer(options, () => {
        viewerApp = new Autodesk.Viewing.ViewingApplication('forgeViewer');
        viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D, { extensions: ['MyAwesomeExtension', 'HandleSelectionExtension', 'ModelSummaryExtension'] });
        viewerApp.loadDocument(documentId, this.onDocumentLoadSuccess, this.onDocumentLoadFailure);
      });
    },

    onDocumentLoadSuccess(doc) {
      // We could still make use of Document.getSubItemsWithProperties()
      // However, when using a ViewingApplication, we have access to the **bubble** attribute,
      // which references the root node of a graph that wraps each object from the Manifest JSON.
      const viewables = viewerApp.bubble.search({ type: 'geometry' });
      if (viewables.length === 0) {
        console.error('Document contains no viewables.');
        return;
      }

      // Choose any of the available viewables
      viewerApp.selectItem(viewables[0].data, this.onItemLoadSuccess, this.onItemLoadFail);
    },

    onDocumentLoadFailure(viewerErrorCode) {
      console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
    },

    onItemLoadSuccess(viewer, item) {
      // item loaded, any custom action?
    },

    onItemLoadFail(errorCode) {
      console.error('onItemLoadFail() - errorCode:' + errorCode);
    },

    getForgeToken(callback) {
      this.$http.get('/api/forge/oauth/token').then(res => {
        callback(res.data.access_token, res.data.expires_in);
      });
    },

    selectObject() {
      const urn = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dGVzdGFzZGYyLzE1MzM2OTQ1MTAxNjMub2Jq';
      this.getForgeToken((access_token, expires_in) => {
        this.$http.get('https://developer.api.autodesk.com/modelderivative/v2/designdata/' + urn + '/manifest', { headers: { Authorization: 'Bearer ' + access_token } }).then(res => {
          this.launchViewer(urn);
        });
      });

    }
  }
};
</script>
