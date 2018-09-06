<template>
<div>
<el-row>
  <el-col :span="8">
    <el-button type="primary" @click="createFile">创建文件夹</el-button>
    <el-dialog :show="showDialog">
    </el-dialog>
    <el-tree
  :props="props1"
  :load="loadNode1"
  lazy
  show-checkbox>
</el-tree>
  </el-col>
  <el-col :span="16">
asd
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
        showDialog: false
      };
    },
    computed: {
  
    },
  
    methods: {
      createFile() {
        this.showDialog = true;
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
