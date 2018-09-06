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

  </el-col>
</el-row>

</div>
</template>
<style>

</style>
<script type="text/babel">
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
    mouted() {
      this.fetch();
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
      }
    }
  };
</script>
