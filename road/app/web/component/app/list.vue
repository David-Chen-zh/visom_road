<template>
  <div>
    <el-row>
      <el-col :span="8">
        <el-button
          type="primary"
          @click="dialogVisible = true">创建文件夹</el-button>
        <el-dialog
          :visible.sync="dialogVisible"
          :before-close="handleClose"
          title="提示"
          width="30%">
          <el-input
            v-model="input"
            placeholder="请输入文件名"></el-input>
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="createFiles">确 定</el-button>
        </el-dialog>
        <el-tree
          :data="buckets"
          :props="defaultProps"
          :load="loadNode"
          :highlight-current="highlight"
          :expand-on-click-node="false"
          lazy
          empty-text="暂无数据">
          <span
            slot-scope="{ node, data }"
            class="custom-tree-node">
            <span>{{ node.label }}</span>
            <div>
              <span v-if="node.parent.id === 0">
                <input
                  id="upload"
                  type = "file"
                  accept=".obj"
                  style="display:none;"
                  @change="upload"/>
                <el-button
                  icon="el-icon-upload2"
                  size="mini"
                  circle
                  @click="clickUpload">
                </el-button>
                <el-button
                  type="danger"
                  size="mini"
                  circle
                  icon="el-icon-delete">
                </el-button>
              </span>
              <span v-if="node.parent.id !== 0">
                <el-button
                  icon="el-icon-document"
                  size="mini"
                  circle
                  @click="translate()">
                </el-button>
              </span>
            </div>
          </span>
        </el-tree>
      </el-col>
      <el-col :span="16">
        <div
          id="forgeViewer"
          style="height: 700px; width: 100%"></div>
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
      highlight: true,
      defaultProps: {
        children: 'children',
        label: 'name',
      },
      dialogVisible: false,
      dialogVisibleFile: false,
      input: '',
      buckets: [],
      bucket: {},
      object: {},
      objects: [],
      files: [],
      file: {},
      objectName: ''
    };
  },
  computed: {
  },
  mounted() {
    this.fetch();
    this.selectObject();
  },
  methods: {
    clickUpload() {
      document.getElementById('upload').click();
    },
    createFiles() {
      this.$http.post('/api/forge/oss/buckets', {
        bucketKey: this.input,
      });
      console.log('创建文件夹', this.input);
      this.dialogVisible = false;
      this.fetch();
    },

    upload(event) {
      let key;
      for (const index in this.buckets) {
        key = this.buckets[index].name;
      }
      const file = event.target.files[0];
      const pos = new FormData();
      pos.append('file', file);
      pos.append('bucketKey', key);
      if (file.size < 1 * 1024 || file.size > 500 * 1024 * 1024) {
        this.$message({
          showClose: true,
          message: '上传失败，文件大小范围：1K~500M',
          type: 'warning'
        });
      } else {
        this.$http.post('/api/forge/oss/objects', pos, { header: { 'Content-type': 'multipart/form-data' } }).then(res => {
          console.log('上传文件');
        });
      }
    },

    translate() {
      let fileName;
      for (const index in this.buckets) {
        fileName = this.buckets[index].name;
      }
      this.$http.get('/api/forge/oss/buckets?id=' + fileName).then(res => {
        this.files = [];
        res.data.forEach(ele => {
          this.files.push({
            file: ele,
            name: ele.text,
            id: ele.id
          });
          this.translateObject(this.files);
        });
      });
    },
    translateObject() {
      for (const index in this.files) {
        this.objectName = this.files[index].id;
      }
      this.$http.post('/api/forge/modelderivative/jobs', {
        objectName: this.objectName
      }).then(res => {
        console.log('转换文件');
      });
    },

    handleClose() {
      this.dialogVisible = false;
      this.dialogVisibleFile = false;
    },

    fetch() {
      this.$http.get('/api/forge/oss/buckets').then(res => {
        this.buckets = [];
        res.data.forEach(ele => {
          this.buckets.push({
            bucket: ele,
            name: ele.text
          });
        });
      });
    },

    loadNode(node, resolve) {
      let objName;
      if (node && node.level === 1) {
        this.$http.get('/api/forge/oss/buckets?id=' + node.data.name).then(res => {
          this.objects = [];
          if (res.data.length !== 0) {
            res.data.forEach(ele => {
              this.objects.push({
                object: ele,
                objectName: ele.text
              });
            });
            for (const index in this.objects) {
              objName = this.objects[index].objectName;
            }
            return resolve([{ name: objName }]);
          } else {
            return resolve([]);
          }

        });
      }
      if (node && node.level > 1) {
        return resolve([]);
      }
    },

    handleChange(file, fileList) {
      this.fileList3 = fileList.slice(-3);
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

<style>
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
</style>