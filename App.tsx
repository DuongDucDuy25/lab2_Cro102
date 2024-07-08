import React, { useState, useEffect, useReducer } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

// Khởi tạo trạng thái ban đầu cho useReducer
const initialState = {
  tasks: [], // Mảng chứa danh sách công việc
  title: '', // Tiêu đề công việc
  content: '', // Nội dung công việc
  editingTaskId: null, // ID của công việc đang chỉnh sửa
};

// Định nghĩa hàm reducer để quản lý các hành động và cập nhật trạng thái
const reducer = (state : any, action : any) => {
  switch (action.type) {
    case 'ADD_TASK': // Hành động thêm công việc mới
      return {
        ...state,
        tasks: [...state.tasks, action.payload], // Thêm công việc mới vào mảng tasks
        title: '', // Reset tiêu đề
        content: '', // Reset nội dung
      };
    case 'EDIT_TASK': // Hành động chỉnh sửa công việc
      return {
        ...state,
        title: action.payload.title, // Cập nhật tiêu đề công việc cần chỉnh sửa
        content: action.payload.content, // Cập nhật nội dung công việc cần chỉnh sửa
        editingTaskId: action.payload.id, // Lưu ID của công việc đang chỉnh sửa
      };
    case 'UPDATE_TASK': // Hành động cập nhật công việc sau khi chỉnh sửa
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === state.editingTaskId
            ? { ...task, title: state.title, content: state.content } // Cập nhật tiêu đề và nội dung công việc
            : task
        ),
        title: '', // Reset tiêu đề
        content: '', // Reset nội dung
        editingTaskId: null, // Reset ID công việc đang chỉnh sửa
      };
    case 'DELETE_TASK': // Hành động xóa công việc
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload), // Loại bỏ công việc khỏi mảng tasks
      };
    case 'TOGGLE_STATUS': // Hành động thay đổi trạng thái công việc (hoàn thành hoặc chưa hoàn thành)
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? { ...task, status: task.status === 'complete' ? 'incomplete' : 'complete' } // Thay đổi trạng thái công việc
            : task
        ),
      };
    case 'SET_TITLE': // Hành động cập nhật tiêu đề
      return { ...state, title: action.payload };
    case 'SET_CONTENT': // Hành động cập nhật nội dung
      return { ...state, content: action.payload };
    default:
      return state; // Trả về trạng thái hiện tại nếu không có hành động phù hợp
  }
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState); // Khởi tạo useReducer với reducer và trạng thái ban đầu

  useEffect(() => {
    console.log(state.tasks); // Ghi log danh sách công việc mỗi khi nó thay đổi
  }, [state.tasks]);

  const addTask = () => {
    if (state.title && state.content) {
      dispatch({
        type: 'ADD_TASK',
        payload: { id: Date.now(), title: state.title, content: state.content, status: 'incomplete' }, // Thêm công việc mới
      });
    }
  };

  const editTask = (id) => {
    const task = state.tasks.find((task) => task.id === id); // Tìm công việc cần chỉnh sửa
    dispatch({
      type: 'EDIT_TASK',
      payload: { id: task.id, title: task.title, content: task.content }, // Cập nhật thông tin công việc cần chỉnh sửa
    });
  };

  const updateTask = () => {
    if (state.editingTaskId) {
      dispatch({ type: 'UPDATE_TASK' }); // Cập nhật công việc sau khi chỉnh sửa
    }
  };

  const deleteTask = (id) => {
    dispatch({ type: 'DELETE_TASK', payload: id }); // Xóa công việc
  };

  const toggleStatus = (id) => {
    dispatch({ type: 'TOGGLE_STATUS', payload: id }); // Thay đổi trạng thái công việc
  };

  const completedTasks = state.tasks.filter((task) => task.status === 'complete').length; // Đếm số công việc hoàn thành
  const incompleteTasks = state.tasks.length - completedTasks; // Đếm số công việc chưa hoàn thành

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>Hoàn thành: {completedTasks} / Chưa hoàn thành: {incompleteTasks}</Text>
      <TextInput
        style={styles.input}
        placeholder="Tiêu đề"
        value={state.title}
        onChangeText={(text) => dispatch({ type: 'SET_TITLE', payload: text })} // Cập nhật tiêu đề công việc
      />
      <TextInput
        style={styles.input}
        placeholder="Nội dung"
        value={state.content}
        onChangeText={(text) => dispatch({ type: 'SET_CONTENT', payload: text })} // Cập nhật nội dung công việc
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={state.editingTaskId ? updateTask : addTask}
      >
        <Text style={styles.buttonText}>{state.editingTaskId ? "Cập nhật" : "Thêm"}</Text>
      </TouchableOpacity>
      <FlatList
        data={state.tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.task}>
            <TouchableOpacity onPress={() => toggleStatus(item.id)}>
              <Text style={item.status === 'complete' ? styles.complete : styles.incomplete}>{item.title}</Text>
            </TouchableOpacity>
            <Text style = {{fontSize : 20}}>{item.content}</Text>
            <TouchableOpacity style={styles.editButton} onPress={() => editTask(item.id)}>
              <Text style={styles.buttonText}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTask(item.id)}>
              <Text style={styles.buttonText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

// Các styles cho ứng dụng
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    padding : 10,
    borderRadius : 20
  },
  task: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    fontSize : 30,
    
  },
  complete: {
    textDecorationLine: 'line-through',
    color : 'green',
    fontSize : 20,
    fontWeight : 'bold'
  },
  incomplete: {
    textDecorationLine: 'none',
    color : 'red',
    fontSize : 20
  },
  counter: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    borderWidth : 1,
    borderBlockColor : 'gray',
    padding : 10,
    borderRadius : 20 , 
    color : 'white',
    backgroundColor : '#8B4513'
  },
  editButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    margin : 5
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    margin : 5
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    justifyContent : 'center',
    alignItems : 'center',
    textAlign : 'center',

  },
  addButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default App;
